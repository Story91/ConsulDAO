import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    config.externals.push("pino-pretty", "lokijs", "encoding");
    
    // Find the oneOf rules array
    const oneOfRule = config.module.rules.find(
      (rule: any) => rule.oneOf
    );
    
    if (oneOfRule && oneOfRule.oneOf) {
      // Modify existing CSS rules to exclude OnchainKit from PostCSS processing
      oneOfRule.oneOf.forEach((rule: any) => {
        if (rule.test && rule.test.toString().includes("css")) {
          // Store original exclude function
          const originalExclude = rule.exclude;
          
          // Modify exclude to also exclude OnchainKit CSS
          rule.exclude = (filePath: string) => {
            // Exclude OnchainKit CSS files
            if (/[\\/]node_modules[\\/]@coinbase[\\/]onchainkit[\\/].*\.css$/.test(filePath)) {
              return true;
            }
            // Use original exclude logic
            if (originalExclude) {
              if (typeof originalExclude === "function") {
                return originalExclude(filePath);
              }
              return originalExclude.test(filePath);
            }
            return false;
          };
        }
      });
      
      // Add a rule BEFORE other CSS rules to handle OnchainKit CSS without PostCSS
      // This must be first to catch OnchainKit CSS before other rules
      oneOfRule.oneOf.unshift({
        test: /[\\/]node_modules[\\/]@coinbase[\\/]onchainkit[\\/].*\.css$/,
        issuer: undefined, // Match any issuer
        use: [
          {
            loader: "css-loader",
            options: {
              importLoaders: 0, // Don't use PostCSS
              modules: false,
            },
          },
        ],
      });
    }
    
    return config;
  },
};

export default nextConfig;
