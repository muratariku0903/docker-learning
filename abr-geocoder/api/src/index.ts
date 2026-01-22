import express, { Request, Response } from 'express';
import { execSync } from 'child_process';

interface GeocodeRequest {
  address?: string;
}

interface GeocodeQueryResult {
  input: string;
}

interface GeocodeResultData {
  output: string;
  others: string[];
  score: number;
  match_level: string;
  coordinate_level: string;
  lat: number | null;
  lon: number | null;
  lg_code: string | null;
  machiaza_id: string | null;
  rsdt_addr_flg: number;
  blk_id: string | null;
  rsdt_id: string | null;
  rsdt2_id: string | null;
  prc_id: string | null;
  pref: string | null;
  county: string | null;
  city: string | null;
  ward: string | null;
  oaza_cho: string | null;
  chome: string | null;
  koaza: string | null;
  blk_num: string | null;
  rsdt_num: string | null;
  rsdt_num2: string | null;
  prc_num1: string | null;
  prc_num2: string | null;
  prc_num3: string | null;
}

interface GeocodeResult {
  query: GeocodeQueryResult;
  result: GeocodeResultData;
}

interface SuccessResponse {
  success: true;
  result: GeocodeResult | null;
}

interface ErrorResponse {
  success: false;
  error: string;
  message?: string;
}

type GeocodeResponse = SuccessResponse | ErrorResponse;

const app = express();
const PORT = process.env.PORT || 3000;
const ABR_GEOCODER_DIR = process.env.ABR_GEOCODER_DIR || '/data/abr-geocoder';

app.use(express.json());

/**
 * POST /geocode
 * Request body: { "address": "東京都千代田区紀尾井町1-3" }
 * Response: { "success": true, "result": { ... } }
 */
app.post('/geocode', (req: Request<object, GeocodeResponse, GeocodeRequest>, res: Response<GeocodeResponse>) => {
  const { address } = req.body;

  if (!address) {
    res.status(400).json({
      success: false,
      error: 'address is required'
    });
    return;
  }

  try {
    const result = execSync(
      `echo "${address.replace(/"/g, '\\"')}" | abrg - -d ${ABR_GEOCODER_DIR}`,
      { encoding: 'utf-8', timeout: 30000 }
    );

    const parsed: GeocodeResult[] = JSON.parse(result);

    res.json({
      success: true,
      result: parsed[0] || null
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      success: false,
      error: 'Geocoding failed',
      message: errorMessage
    });
  }
});

/**
 * GET /health
 * Health check endpoint
 */
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`abr-geocoder API server running on port ${PORT}`);
});
