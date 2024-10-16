import { MikrusMemoryData, MikrusStatusResponse } from "./mikrusSchemas";

export class MikrusService {
  private MIKRUS_API_URL: string = process.env.MIKRUS_HOST || "";
  private MIKRUS_SRV: string = process.env.MIKRUS_SRV || "";
  private MIKRUS_KEY: string = process.env.MIKRUS_KEY || "";

  constructor() {
    this.checkEnvForMikrus();
  }

  private checkEnvForMikrus() {
    if (!this.MIKRUS_API_URL || !this.MIKRUS_SRV || !this.MIKRUS_KEY) {
      throw new Error(
        "Please provide all the necessary environment variables for the Mikrus API connection"
      );
    }
  }
  private async mikrusRequest<T>(endpoint: string): Promise<T> {
    try {
      const formData = new URLSearchParams({
        srv: this.MIKRUS_SRV,
        key: this.MIKRUS_KEY,
      });

      const response = await fetch(`${this.MIKRUS_API_URL}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`MIKR.US API Error: ${error.message}`);
      }
      throw error;
    }
  }
  private parseMemoryData(data: MikrusStatusResponse) {
    // Split the input string into lines
    const lines = data.free.split("\n");

    // Extract headers from the first line
    // const headers = lines[0].split(' ');

    // Extract memory values from the second line
    const memValues = lines[1].replace("Mem: ", "").split(" ").map(Number);

    // Extract swap values from the third line
    const swapValues = lines[2].replace("Swap: ", "").split(" ").map(Number);

    // Build the final JSON structure
    const result: MikrusMemoryData = {
      free: {
        memory: {
          total: memValues[0],
          used: memValues[1],
          free: memValues[2],
          shared: memValues[3],
          "buff/cache": memValues[4],
          available: memValues[5],
        },
        swap: {
          total: swapValues[0],
          used: swapValues[1],
          free: swapValues[2],
        },
      },
    };

    return result;
  }
  public async getStatus(): Promise<MikrusMemoryData> {
    const resp = await this.mikrusRequest<MikrusStatusResponse>("/stats");
    return this.parseMemoryData(resp);
  }
}
