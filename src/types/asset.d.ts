// 告诉 TypeScript，所有以 .png 结尾的导入，都应该被视为一个导出字符串 (URL) 的模块
declare module '*.png' {
  const src: string;
  export default src;
}

// 可选：同时声明其他资产类型，例如 SVG 或 JPG
declare module '*.jpg' {
  const src: string;
  export default src;
}

declare module '*.svg' {
  const src: string;  
  export default src;
}