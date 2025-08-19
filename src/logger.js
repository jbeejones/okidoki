// Logger utility
const logger = {
    verbose: false,
    setVerbose: (value) => { logger.verbose = value; },
    log: (message) => { if (logger.verbose) console.log(message); },
    info: (message) => console.log(message),
    error: (message) => console.error('Error:', message)
};

export default logger; 