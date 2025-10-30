module.exports = [
"[externals]/react/jsx-dev-runtime [external] (react/jsx-dev-runtime, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("react/jsx-dev-runtime", () => require("react/jsx-dev-runtime"));

module.exports = mod;
}),
"[externals]/@supabase/auth-helpers-nextjs [external] (@supabase/auth-helpers-nextjs, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("@supabase/auth-helpers-nextjs", () => require("@supabase/auth-helpers-nextjs"));

module.exports = mod;
}),
"[externals]/@supabase/auth-helpers-react [external] (@supabase/auth-helpers-react, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("@supabase/auth-helpers-react", () => require("@supabase/auth-helpers-react"));

module.exports = mod;
}),
"[project]/pages/_app.tsx [ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react/jsx-dev-runtime [external] (react/jsx-dev-runtime, cjs)");
// Importações do Supabase Auth Helpers (MUITO IMPORTANTE - Mantenha isto!)
var __TURBOPACK__imported__module__$5b$externals$5d2f40$supabase$2f$auth$2d$helpers$2d$nextjs__$5b$external$5d$__$2840$supabase$2f$auth$2d$helpers$2d$nextjs$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/@supabase/auth-helpers-nextjs [external] (@supabase/auth-helpers-nextjs, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f40$supabase$2f$auth$2d$helpers$2d$react__$5b$external$5d$__$2840$supabase$2f$auth$2d$helpers$2d$react$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/@supabase/auth-helpers-react [external] (@supabase/auth-helpers-react, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react [external] (react, cjs)");
;
;
;
;
;
function MyApp({ Component, pageProps }) {
    // Cria o cliente Supabase (necessário para o Provedor)
    const [supabaseClient] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(()=>(0, __TURBOPACK__imported__module__$5b$externals$5d2f40$supabase$2f$auth$2d$helpers$2d$nextjs__$5b$external$5d$__$2840$supabase$2f$auth$2d$helpers$2d$nextjs$2c$__cjs$29$__["createPagesBrowserClient"])());
    return(// Envolve a aplicação no Provedor de Sessão
    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$externals$5d2f40$supabase$2f$auth$2d$helpers$2d$react__$5b$external$5d$__$2840$supabase$2f$auth$2d$helpers$2d$react$2c$__cjs$29$__["SessionContextProvider"], {
        supabaseClient: supabaseClient,
        initialSession: pageProps.initialSession,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(Component, {
            ...pageProps
        }, void 0, false, {
            fileName: "[project]/pages/_app.tsx",
            lineNumber: 26,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/pages/_app.tsx",
        lineNumber: 22,
        columnNumber: 5
    }, this));
}
const __TURBOPACK__default__export__ = MyApp;
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__eb7fdad0._.js.map