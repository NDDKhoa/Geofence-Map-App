const authService = require('../services/auth.service');

exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        
        const result = await authService.login(email, password);
        
        res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        next(error);
    }
};

exports.register = async (req, res, next) => {
    try {
        const { email, password, fullName } = req.body;
        const result = await authService.register(email, password, fullName);
        res.status(201).json({
            success: true,
            data: result
        });
    } catch (error) {
        next(error);
    }
};
