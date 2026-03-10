pipeline {
    agent any

    // ── Environment ──────────────────────────────────────────────
    environment {
        // Docker Hub image — shrinithi04's repository
        DOCKER_IMAGE      = "shrinithi04/project-management-tool"
        // Docker Hub credentials stored in Jenkins (Credentials → Username/Password)
        DOCKER_CREDENTIALS = credentials("dockerhub-credentials")
        // SSH credentials to the Azure VM (Jenkins SSH Username with Private Key)
        VM_SSH_CREDENTIALS = credentials("azure-vm-ssh")
        // Azure VM address
        VM_HOST           = "4.188.84.115"
        VM_USER           = "azureuser"
        // Remote directory on VM where docker-compose.yml + .env live
        VM_APP_DIR        = "/home/azureuser/app"
    }

    // ── Triggers ─────────────────────────────────────────────────
    triggers {
        // Automatically trigger on GitHub push via webhook
        githubPush()
    }

    options {
        // Keep only the last 10 builds
        buildDiscarder(logRotator(numToKeepStr: "10"))
        timestamps()
    }

    // ── Stages ───────────────────────────────────────────────────
    stages {

        // Stage 1 ─ Checkout source code
        stage("Checkout") {
            steps {
                checkout scm
            }
        }

        stage("Build & Push Image") {
            steps {
                script {
                    def imageTag = "${DOCKER_IMAGE}:${env.BUILD_NUMBER}"
                    def latestTag = "${DOCKER_IMAGE}:latest"

                    echo "Building Docker image: ${imageTag}"

                    // Build the image
                    sh """
                        docker build -t ${imageTag} -t ${latestTag} .
                    """

                    // Login and push to Docker Hub
                    sh """
                        echo "${DOCKER_CREDENTIALS_PSW}" | docker login -u "${DOCKER_CREDENTIALS_USR}" --password-stdin
                        docker push ${imageTag}
                        docker push ${latestTag}
                        docker logout
                    """

                    echo "Pushed ${imageTag} and ${latestTag} to Docker Hub"
                }
            }
        }

        // Stage 3 ─ Deploy to Azure VM
        stage("Deploy to Azure VM") {
            steps {
                script {
                    // SSH into the VM and deploy
                    sshagent(credentials: ["azure-vm-ssh"]) {
                        sh """
                            ssh -o StrictHostKeyChecking=no ${VM_USER}@${VM_HOST} '
                                set -e
                                echo "=== Pulling latest image ==="
                                docker pull ${DOCKER_IMAGE}:latest

                                echo "=== Restarting app container ==="
                                cd ${VM_APP_DIR}
                                docker compose --env-file .env up -d --no-deps next-app

                                echo "=== Cleaning up old images ==="
                                docker image prune -f

                                echo "=== Deployment complete ==="
                            '
                        """
                    }
                }
            }
        }
    }

    // ── Post-build actions ───────────────────────────────────────
    post {
        success {
            echo "✅ Deployment of build #${env.BUILD_NUMBER} succeeded."
        }
        failure {
            echo "❌ Pipeline failed at stage: ${env.STAGE_NAME}. Check logs above."
        }
        always {
            // Clean up local images to save Jenkins disk space
            sh "docker rmi ${DOCKER_IMAGE}:${env.BUILD_NUMBER} || true"
        }
    }
}
