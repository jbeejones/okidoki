/**
 * Logger utility with configurable verbosity for debugging and output
 */
const logger = {
    verbose: false,
    /** Enable or disable verbose logging */
    setVerbose: (value) => { logger.verbose = value; },
    /** Log message only when verbose mode is enabled */
    log: (message) => { if (logger.verbose) console.log(message); },
    /** Always log informational messages */
    info: (message) => console.log(message),
    /** Always log error messages with Error prefix */
    error: (message) => console.error('Error:', message)
};

export default logger; 