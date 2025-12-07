const router = require('express').Router();
const Project = require('../models/Diagrams');
const fetchUser = require('../middleware/fetchUser');


router.get('/diagrams', fetchUser, async (req, res) => {
    try {
        const projects = await Project.find({ userId: req.user._id });
        res.json(projects);
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
});


router.post('/save', fetchUser, async (req, res) => {
    try {
        const { name, nodes, edges, projectId } = req.body;
        if (projectId) {
            let project = await Project.findById(projectId);
            
            if (!project) {
                return res.status(404).send("Project not found");
            }
            if (project.userId.toString() !== req.user._id) {
                return res.status(401).send("Not Allowed");
            }

            project = await Project.findByIdAndUpdate(
                projectId, 
                { $set: { name, nodes, edges } }, 
                { new: true }
            );
            return res.json(project);
        }
        const project = new Project({
            name,
            nodes,
            edges,
            userId: req.user._id
        });
        
        const savedProject = await project.save();
        res.json(savedProject);

    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
});


router.delete('/delete/:id', fetchUser, async (req, res) => {
    try {
        let project = await Project.findById(req.params.id);
        if (!project) {
            return res.status(404).send("Not Found");
        }

        if (project.userId.toString() !== req.user._id) {
            return res.status(401).send("Not Allowed");
        }

        project = await Project.findByIdAndDelete(req.params.id);
        res.json({ "Success": "Project has been deleted", project: project });
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
});
router.get('/shared/:id', async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) {
            return res.status(404).send("Diagram not found");
        }
        // We return the project regardless of who owns it
        res.json(project);
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
});

module.exports = router;