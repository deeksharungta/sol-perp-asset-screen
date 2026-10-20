// Metro turns an imported image into a numeric asset ID that <Image source> accepts.
declare module "*.png" {
  const assetId: number;
  export default assetId;
}
