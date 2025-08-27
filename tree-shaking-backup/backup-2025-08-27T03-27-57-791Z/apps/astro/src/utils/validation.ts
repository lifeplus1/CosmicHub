import { z } from 'zod';

// Birth chart validation schema
});

// User profile validation schema
    .optional(),
});

// Chart calculation validation
    .optional(),
});

// Healwave session validation

// Synastry request/response schemas (shared between UI and potential backend alignment)
export const synastryRequestSchema = z.object({
  person1: birthDataSchema,
  person2: birthDataSchema,
});

  interaspects: z.array(
    z.object({
      person1_planet: z.string(),
      person2_planet: z.string(),
      aspect: z.string(),
      orb: z.number(),
      strength: z.string(),
      interpretation: z.string(),
    })
  ),
  house_overlays: z.array(
    z.object({
      person1_planet: z.string(),
      person2_house: z.number(),
      interpretation: z.string(),
    })
  ),
  composite_chart: z.object({
    midpoint_sun: z.number(),
    midpoint_moon: z.number(),
    relationship_purpose: z.string(),
  }),
  summary: z.object({
    key_themes: z.array(z.string()),
    strengths: z.array(z.string()),
    challenges: z.array(z.string()),
    advice: z.array(z.string()),
  }),
});

// Form validation helpers
  | { data?: never; error: z.ZodError<T>['errors'] | string };

    return { data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.errors };
    }
    return { error: 'Invalid birth data' };
  }
};

export const validateUserProfile = (
  data: unknown
): ValidationResult<z.infer<typeof userProfileSchema>> => {
  try {
    const validated = userProfileSchema.parse(data);
    return { data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.errors };
    }
    return { error: 'Invalid user profile data' };
  }
};

    return { data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.errors };
    }
    return { error: 'Invalid healwave session data' };
  }
};

// Date and time validation utilities
  }
  const date = new Date(dateString);
  const time = date.getTime();
  if (Number.isNaN(time)) {
    return false;
  }
  const year = date.getFullYear();
  return year >= 1901 && year < 2100;
};

  }
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(timeString);
};

  }
  return lat >= -90 && lat <= 90;
};

  }
  return lng >= -180 && lng <= 180;
};

// Sanitization utilities
  }
  return input.trim().replace(/[<>]/g, '');
};

  }
  const num = parseFloat(input);
  return Number.isNaN(num) ? null : num;
};

export type UserProfile = z.infer<typeof userProfileSchema>;
