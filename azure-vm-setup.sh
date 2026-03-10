#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
#  azure-vm-setup.sh
#  Run this ONCE on a fresh Azure Ubuntu 22.04 VM after first SSH login.
#
#  Usage:
#    chmod +x azure-vm-setup.sh
#    sudo ./azure-vm-setup.sh
# ─────────────────────────────────────────────────────────────────────────────

set -euo pipefail

APP_USER="azureuser"
APP_DIR="/home/${APP_USER}/app"
# Postgres data stored on OS disk (sda) — persistent across VM restarts
# NOTE: /mnt (sdb) is Azure's ephemeral temp disk — data WILL BE LOST on VM stop!
PGDATA_DIR="/home/${APP_USER}/pgdata"

echo "============================================================"
echo " Step 1: Update system packages"
echo "============================================================"
apt-get update -y && apt-get upgrade -y

echo "============================================================"
echo " Step 2: Install Docker"
echo "============================================================"
apt-get install -y ca-certificates curl gnupg lsb-release
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg \
    | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
chmod a+r /etc/apt/keyrings/docker.gpg

echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" \
    | tee /etc/apt/sources.list.d/docker.list > /dev/null

apt-get update -y
apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

usermod -aG docker "${APP_USER}"
echo "Docker installed: $(docker --version)"
echo "Docker Compose installed: $(docker compose version)"

echo "============================================================"
echo " Step 3: Create PostgreSQL data directory (on OS disk sda)"
echo "          ${PGDATA_DIR} — survives VM restarts & stop/start"
echo "============================================================"
mkdir -p "${PGDATA_DIR}"
chown -R 999:999 "${PGDATA_DIR}"   # UID 999 = postgres user inside container
chmod 700 "${PGDATA_DIR}"
echo "Created ${PGDATA_DIR}"

echo "============================================================"
echo " Step 4: Create application directory"
echo "============================================================"
mkdir -p "${APP_DIR}"
chown "${APP_USER}:${APP_USER}" "${APP_DIR}"
echo "Created ${APP_DIR}"

echo "============================================================"
echo " Step 5: Open port 3000 in VM firewall"
echo "============================================================"
# Also open port 3000 in Azure Portal → VM → Networking → Inbound port rules
ufw allow 3000/tcp || true
ufw allow OpenSSH || true
ufw --force enable || true

echo "============================================================"
echo " Step 6: Generate SSH key for Jenkins deployments"
echo "============================================================"
SSH_KEY_PATH="/home/${APP_USER}/.ssh/id_rsa_jenkins"
if [ ! -f "${SSH_KEY_PATH}" ]; then
    sudo -u "${APP_USER}" ssh-keygen -t rsa -b 4096 -f "${SSH_KEY_PATH}" -N '' -C 'jenkins-deploy'
    cat "${SSH_KEY_PATH}.pub" >> "/home/${APP_USER}/.ssh/authorized_keys"
    chmod 600 "/home/${APP_USER}/.ssh/authorized_keys"
    chown "${APP_USER}:${APP_USER}" "/home/${APP_USER}/.ssh/authorized_keys"
fi

echo ""
echo "============================================================"
echo " ✅  VM setup complete!"
echo "============================================================"
echo ""
echo "NEXT STEPS:"
echo " 1. Open a new local terminal and copy files to the VM:"
echo "    scp -i your_key.pem docker-compose.yml azureuser@4.188.84.115:${APP_DIR}/"
echo ""
echo " 2. Start the containers:"
echo "    cd ${APP_DIR} && docker compose up -d"
echo ""
echo " 3. Jenkins SSH private key is at: ${SSH_KEY_PATH}"
echo "    Add it to Jenkins → Credentials → azure-vm-ssh"
echo ""
