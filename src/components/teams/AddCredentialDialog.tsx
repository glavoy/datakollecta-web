import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { teamService } from "@/services/teamService";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

interface AddCredentialDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

interface Project {
    id: string;
    name: string;
}

export function AddCredentialDialog({ open, onOpenChange, onSuccess }: AddCredentialDialogProps) {
    const [loading, setLoading] = useState(false);
    const [projects, setProjects] = useState<Project[]>([]);
    const [formData, setFormData] = useState({
        projectId: "",
        username: "",
        password: "",
        description: "",
    });

    // Fetch projects when dialog opens
    useEffect(() => {
        if (open) {
            loadProjects();
        }
    }, [open]);

    const loadProjects = async () => {
        const { data } = await supabase.from("projects").select("id, name").eq("is_active", true);
        if (data) setProjects(data);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.projectId || !formData.username || !formData.password) {
            toast.error("Please fill in all required fields");
            return;
        }

        setLoading(true);
        try {
            await teamService.createCredential(
                formData.projectId,
                formData.username,
                formData.password,
                formData.description
            );
            toast.success("Credential created successfully");
            onSuccess();
            onOpenChange(false);
            // Reset form
            setFormData({ projectId: "", username: "", password: "", description: "" });
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "Failed to create credential");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add App Credential</DialogTitle>
                    <DialogDescription>
                        Create a new login for a mobile surveyor.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="project">Project</Label>
                        <select
                            id="project"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            value={formData.projectId}
                            onChange={(e) => setFormData(prev => ({ ...prev, projectId: e.target.value }))}
                        >
                            <option value="">Select a project</option>
                            {projects.map(p => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="username">Username</Label>
                        <Input
                            id="username"
                            value={formData.username}
                            onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                            placeholder="e.g. surveyor1"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                            id="password"
                            type="password"
                            value={formData.password}
                            onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                            placeholder="Secure password"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="description">Description (Optional)</Label>
                        <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                            placeholder="e.g. Tablet 4 - Field Team A"
                        />
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Creating..." : "Create Credential"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
