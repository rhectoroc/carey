import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    /* config options here */
    output: "standalone",
    async rewrites() {
        // En producción o desarrollo, redirige las llamadas /api al contenedor de la app backend
        let apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
        if (apiUrl.endsWith('/')) {
            apiUrl = apiUrl.slice(0, -1);
        }
        return [
            {
                source: "/api/:path*",
                destination: `${apiUrl}/api/:path*`,
            },
        ];
    },
};

export default nextConfig;
