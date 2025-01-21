import { Viewer, Entity } from "resium";
import { Ion, Cartesian3 } from "cesium";

// You'll need a Cesium ion access token
Ion.defaultAccessToken = 'your_cesium_token';

const PALISADES_POSITION = Cartesian3.fromDegrees(-120.2358, 39.1969, 1000);

export default function CesiumTerrain() {
  return (
    <Viewer 
      terrainProvider={createWorldTerrain()}
      scene3DOnly={true}
      homeButton={false}
    >
      <Entity
        position={PALISADES_POSITION}
        description="Palisades Tahoe Ski Resort"
      />
    </Viewer>
  );
} 