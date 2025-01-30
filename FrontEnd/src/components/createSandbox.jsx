const createSandbox = () => {
  // Create a proxy console to capture logs
  const logs = [];
  const proxiedConsole = {
    log: (...args) => {
      logs.push(["log", ...args]);
    },
    error: (...args) => {
      logs.push(["error", ...args]);
    },
    warn: (...args) => {
      logs.push(["warn", ...args]);
    },
    info: (...args) => {
      logs.push(["info", ...args]);
    },
  };

  // Create a safe evaluation function
  const safeEval = (code) => {
    try {
      // Create function from code with proxied console
      const func = new Function(
        "console",
        `
          "use strict";
          ${code};
        `
      );

      // Execute the code with proxied console
      const result = func(proxiedConsole);

      return {
        success: true,
        result: result,
        logs: logs,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        logs: logs,
      };
    }
  };

  return safeEval;
};

export default createSandbox;
