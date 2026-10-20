import Svg, { Path } from "react-native-svg";

type TriangleIconProps = {
  direction: "up" | "down";
  color: string;
  width?: number;
  height?: number;
};

export function TriangleIcon({
  direction,
  color,
  width = 6,
  height = 5,
}: TriangleIconProps) {
  return (
    <Svg
      width={width}
      height={height}
      viewBox="0 0 6 5"
      preserveAspectRatio="none"
      fill="none"
      style={{
        transform: [{ rotate: direction === "up" ? "0deg" : "180deg" }],
      }}
    >
      <Path
        d="M2.05347 0.483314C2.54623 -0.161014 3.45399 -0.161195 3.94657 0.483314L5.71206 2.79481C6.38086 3.67042 5.81009 4.99966 4.76554 5H1.23452C0.189793 4.99987 -0.380848 3.67049 0.287982 2.79481L2.05347 0.483314Z"
        fill={color}
      />
    </Svg>
  );
}
