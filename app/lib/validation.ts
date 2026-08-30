import { z } from 'zod';

/**
 * Validation schema for Tarot API request
 */
export const tarotRequestSchema = z.object({
  question: z.string().min(1, '问题不能为空').max(200, '问题长度不能超过200字').optional(),
  spreadType: z.enum(['single', 'three', 'celtic']),
  deviceId: z.string().min(1, '设备ID不能为空'),
});

/**
 * Validation schema for Bazi API request
 */
export const baziRequestSchema = z.object({
  name: z.string().optional(),
  birthDate: z.string().min(1, '出生日期不能为空'),
  birthTime: z.string().min(1, '出生时间不能为空'),
  gender: z.enum(['male', 'female']),
  deviceId: z.string().min(1, '设备ID不能为空'),
});

/**
 * Validation schema for Ziwei API request
 */
export const ziweiRequestSchema = z.object({
  name: z.string().optional(),
  birthDate: z.string().min(1, '出生日期不能为空'),
  birthTime: z.string().min(1, '出生时间不能为空'),
  gender: z.enum(['male', 'female']),
  deviceId: z.string().min(1, '设备ID不能为空'),
});

/**
 * Validation schema for Daily API request
 */
export const dailyRequestSchema = z.object({
  zodiac: z.string().min(1, '星座不能为空'),
  deviceId: z.string().min(1, '设备ID不能为空'),
});

/**
 * Generic validation function
 * @param schema Zod schema to validate against
 * @param data Data to validate
 * @returns Parsed and validated data
 * @throws ZodError if validation fails
 */
export function validateData<T>(schema: z.ZodType<T, any, T>, data: unknown): T {
  return schema.parse(data);
}

/**
 * Safe validation that returns result object
 */
export function safeValidate<T>(
  schema: z.ZodType<T, any, T>,
  data: unknown,
): { success: boolean; data?: T; error?: z.ZodError<T> } {
  try {
    const parsed = schema.parse(data);
    return { success: true, data: parsed };
  } catch (err) {
    if (err instanceof z.ZodError) {
      return { success: false, error: err };
    }
    throw err;
  }
}
