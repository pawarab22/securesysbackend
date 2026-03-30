require('dotenv').config();
const { app } = require('./app');
const { sequelize } = require('./models');
const logger = require('./utils/logger');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        await sequelize.authenticate();
        logger.info('Database connected successfully.');

        // For demo, we are syncing models
        // In production use migrations
        await sequelize.sync({ alter: true });
        logger.info('Models synchronized successfully.');

        app.listen(PORT, () => {
            logger.info(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        logger.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();
