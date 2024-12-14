const Request = require('../db/models/fixingRequests');

exports.createRequest = async (req, res) => {
    try {
        const newRequest = new Request(req.body);
        await newRequest.save();
        res.status(201).json(newRequest);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.getAllRequests = async (req, res) => {
    try {
        const requests = await Request.find();
        res.json(requests);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.getRequestById = async (req, res) => {
    try {
        const request = await Request.findById(req.params.id);
        res.json(request);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};
