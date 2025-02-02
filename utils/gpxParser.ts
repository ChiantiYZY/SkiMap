export interface GPXPoint {
  latitude: number;
  longitude: number;
  elevation: number;
  time?: string;
}

export function parseGPX(gpxContent: string): GPXPoint[] {
  const parser = new DOMParser();
  const gpxDoc = parser.parseFromString(gpxContent, "text/xml");
  const trkpts = gpxDoc.getElementsByTagName("trkpt");
  
  const points: GPXPoint[] = [];
  
  for (let i = 0; i < trkpts.length; i++) {
    const trkpt = trkpts[i];
    const lat = parseFloat(trkpt.getAttribute("lat") || "0");
    const lon = parseFloat(trkpt.getAttribute("lon") || "0");
    const ele = trkpt.getElementsByTagName("ele")[0]?.textContent || "0";
    const time = trkpt.getElementsByTagName("time")[0]?.textContent;
    
    points.push({
      latitude: lat,
      longitude: lon,
      elevation: parseFloat(ele),
      time: time
    });
  }
  
  return points;
} 