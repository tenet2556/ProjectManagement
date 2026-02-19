import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

interface Project {
  id: string;
  name: string;
  status: string;
}

export default function ProjectTable({
  projects,
  role,
}: {
  projects: Project[];
  role: string;
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Status</TableHead>
          {role !== "TEAM_MEMBER" && <TableHead>Actions</TableHead>}
        </TableRow>
      </TableHeader>

      <TableBody>
        {projects.map((project) => (
          <TableRow key={project.id}>
            <TableCell>{project.name}</TableCell>
            <TableCell>{project.status}</TableCell>

            {role !== "TEAM_MEMBER" && (
              <TableCell>
                <Button size="sm">Edit</Button>
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
