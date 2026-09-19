import { AbsoluteFill, CalculateMetadataFunction, Composition } from "remotion";

type Props = {
  headline: string;
};

const calculateMetadata: CalculateMetadataFunction<Props> = () => {
  return {};
};

export const MyComposition = () => {
  return (
    <Composition
      id="VectorsVerdictsShort"
      component={MyComponent}
      durationInFrames={2700}
      fps={30}
      width={1080}
      height={1920}
      defaultProps={{ headline: "Vectors Verdicts" }}
      calculateMetadata={calculateMetadata}
    />
  );
};

export const MyComponent: React.FC<Props> = ({ headline }) => {
  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#0B0E14",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          color: "#E6EDF3",
          fontSize: 90,
          fontWeight: 700,
          textAlign: "center",
          padding: 60,
        }}
      >
        {headline}
      </div>
    </AbsoluteFill>
  );
};
