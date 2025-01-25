import { NextResponse } from 'next/server';

// Sample ski run data matching the scale and format of skiRunsData
const sampleRunsData = [
  {
    name: "Dynamic Run 1",
    color: "green",
    points: [
      [-4, 5, 0],
      [-2, 3, 1],
      [-1, 1, 0],
      [-1, -2, 0],
    ],
  },
  {
    name: "Dynamic Run 2",
    color: "blue",
    points: [
      [1, 5, 0],
      [3, 3, -1],
      [4, 1, 0],
      [4, -2, 0],
    ],
  },
  {
    name: "Dynamic Run 3",
    color: "black",
    points: [
      [6, 5, 0],
      [4, 3, 2],
      [2, 1, -1],
      [1, -2, 0],
    ],
  }
];

export async function GET() {  
  try {
    // Simulate some random selection of data
    const randomizedData = [...sampleRunsData]
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.floor(Math.random() * sampleRunsData.length) + 1);

    const output = NextResponse.json(
        { 
          success: true, 
          data: randomizedData 
        },
        { status: 200 }
      );

    return output;
  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch runs data' 
      },
      { status: 500 }
    );
  }
} 