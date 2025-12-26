// src/lib/math/MathUtils.ts
import katex from "katex";

/**
 * Render a LaTeX string to HTML using KaTeX
 */
export function renderLatex(
  latex: string,
  options?: {
    displayMode?: boolean;
    throwOnError?: boolean;
  }
): string {
  try {
    return katex.renderToString(latex, {
      displayMode: options?.displayMode ?? false,
      throwOnError: options?.throwOnError ?? false,
      trust: true,
      strict: false,
    });
  } catch (error) {
    console.error("KaTeX rendering error:", error);
    return `<span class="math-error" style="color: red;">${latex}</span>`;
  }
}

/**
 * Check if a LaTeX string is valid
 */
export function isValidLatex(latex: string): boolean {
  try {
    katex.renderToString(latex, { throwOnError: true });
    return true;
  } catch {
    return false;
  }
}

/**
 * Math template categories and their templates
 */
export interface MathTemplate {
  name: string;
  label: string;
  latex: string;
  description: string;
  category: string;
}

export const mathTemplates: MathTemplate[] = [
  // Basic Operations
  {
    name: "fraction",
    label: "Fraction",
    latex: "\\frac{a}{b}",
    description: "a over b",
    category: "Basic",
  },
  {
    name: "power",
    label: "Power",
    latex: "x^{n}",
    description: "x to the power n",
    category: "Basic",
  },
  {
    name: "subscript",
    label: "Subscript",
    latex: "x_{i}",
    description: "x sub i",
    category: "Basic",
  },
  {
    name: "sqrt",
    label: "Square Root",
    latex: "\\sqrt{x}",
    description: "Square root of x",
    category: "Basic",
  },
  {
    name: "nthroot",
    label: "Nth Root",
    latex: "\\sqrt[n]{x}",
    description: "nth root of x",
    category: "Basic",
  },

  // Calculus
  {
    name: "integral",
    label: "Integral",
    latex: "\\int_{a}^{b} f(x) \\, dx",
    description: "Definite integral from a to b",
    category: "Calculus",
  },
  {
    name: "integral-indefinite",
    label: "Indefinite Integral",
    latex: "\\int f(x) \\, dx",
    description: "Indefinite integral",
    category: "Calculus",
  },
  {
    name: "derivative",
    label: "Derivative",
    latex: "\\frac{d}{dx}",
    description: "Derivative with respect to x",
    category: "Calculus",
  },
  {
    name: "partial",
    label: "Partial Derivative",
    latex: "\\frac{\\partial f}{\\partial x}",
    description: "Partial derivative",
    category: "Calculus",
  },
  {
    name: "limit",
    label: "Limit",
    latex: "\\lim_{x \\to a} f(x)",
    description: "Limit as x approaches a",
    category: "Calculus",
  },

  // Summation & Products
  {
    name: "sum",
    label: "Summation",
    latex: "\\sum_{i=1}^{n} a_i",
    description: "Sum from i=1 to n",
    category: "Series",
  },
  {
    name: "product",
    label: "Product",
    latex: "\\prod_{i=1}^{n} a_i",
    description: "Product from i=1 to n",
    category: "Series",
  },
  {
    name: "infinity-sum",
    label: "Infinite Sum",
    latex: "\\sum_{n=0}^{\\infty} a_n",
    description: "Infinite series",
    category: "Series",
  },

  // Greek Letters
  {
    name: "alpha",
    label: "Alpha",
    latex: "\\alpha",
    description: "Greek letter alpha",
    category: "Greek",
  },
  {
    name: "beta",
    label: "Beta",
    latex: "\\beta",
    description: "Greek letter beta",
    category: "Greek",
  },
  {
    name: "gamma",
    label: "Gamma",
    latex: "\\gamma",
    description: "Greek letter gamma",
    category: "Greek",
  },
  {
    name: "delta",
    label: "Delta",
    latex: "\\Delta",
    description: "Greek letter delta (uppercase)",
    category: "Greek",
  },
  {
    name: "theta",
    label: "Theta",
    latex: "\\theta",
    description: "Greek letter theta",
    category: "Greek",
  },
  {
    name: "pi",
    label: "Pi",
    latex: "\\pi",
    description: "Greek letter pi",
    category: "Greek",
  },
  {
    name: "sigma",
    label: "Sigma",
    latex: "\\sigma",
    description: "Greek letter sigma",
    category: "Greek",
  },
  {
    name: "omega",
    label: "Omega",
    latex: "\\omega",
    description: "Greek letter omega",
    category: "Greek",
  },

  // Matrices
  {
    name: "matrix-2x2",
    label: "2×2 Matrix",
    latex: "\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}",
    description: "2 by 2 matrix",
    category: "Matrices",
  },
  {
    name: "matrix-3x3",
    label: "3×3 Matrix",
    latex:
      "\\begin{pmatrix} a & b & c \\\\ d & e & f \\\\ g & h & i \\end{pmatrix}",
    description: "3 by 3 matrix",
    category: "Matrices",
  },
  {
    name: "determinant",
    label: "Determinant",
    latex: "\\begin{vmatrix} a & b \\\\ c & d \\end{vmatrix}",
    description: "Determinant notation",
    category: "Matrices",
  },

  // Relations & Symbols
  {
    name: "not-equal",
    label: "Not Equal",
    latex: "\\neq",
    description: "Not equal to",
    category: "Relations",
  },
  {
    name: "approx",
    label: "Approximately",
    latex: "\\approx",
    description: "Approximately equal",
    category: "Relations",
  },
  {
    name: "leq",
    label: "Less or Equal",
    latex: "\\leq",
    description: "Less than or equal",
    category: "Relations",
  },
  {
    name: "geq",
    label: "Greater or Equal",
    latex: "\\geq",
    description: "Greater than or equal",
    category: "Relations",
  },
  {
    name: "infinity",
    label: "Infinity",
    latex: "\\infty",
    description: "Infinity symbol",
    category: "Relations",
  },
  {
    name: "therefore",
    label: "Therefore",
    latex: "\\therefore",
    description: "Therefore symbol",
    category: "Relations",
  },

  // Sets
  {
    name: "in-set",
    label: "Element Of",
    latex: "\\in",
    description: "Element of a set",
    category: "Sets",
  },
  {
    name: "not-in-set",
    label: "Not Element Of",
    latex: "\\notin",
    description: "Not an element of",
    category: "Sets",
  },
  {
    name: "subset",
    label: "Subset",
    latex: "\\subseteq",
    description: "Subset or equal",
    category: "Sets",
  },
  {
    name: "union",
    label: "Union",
    latex: "\\cup",
    description: "Set union",
    category: "Sets",
  },
  {
    name: "intersection",
    label: "Intersection",
    latex: "\\cap",
    description: "Set intersection",
    category: "Sets",
  },
  {
    name: "empty-set",
    label: "Empty Set",
    latex: "\\emptyset",
    description: "Empty set symbol",
    category: "Sets",
  },

  // Trigonometry
  {
    name: "sin",
    label: "Sine",
    latex: "\\sin(\\theta)",
    description: "Sine function",
    category: "Trigonometry",
  },
  {
    name: "cos",
    label: "Cosine",
    latex: "\\cos(\\theta)",
    description: "Cosine function",
    category: "Trigonometry",
  },
  {
    name: "tan",
    label: "Tangent",
    latex: "\\tan(\\theta)",
    description: "Tangent function",
    category: "Trigonometry",
  },

  // Common Formulas
  {
    name: "quadratic",
    label: "Quadratic Formula",
    latex: "x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}",
    description: "Quadratic formula",
    category: "Formulas",
  },
  {
    name: "pythagorean",
    label: "Pythagorean Theorem",
    latex: "a^2 + b^2 = c^2",
    description: "Pythagorean theorem",
    category: "Formulas",
  },
  {
    name: "euler",
    label: "Euler's Identity",
    latex: "e^{i\\pi} + 1 = 0",
    description: "Euler's identity",
    category: "Formulas",
  },
  {
    name: "binomial",
    label: "Binomial Coefficient",
    latex: "\\binom{n}{k}",
    description: "n choose k",
    category: "Formulas",
  },
];

/**
 * Get templates by category
 */
export function getTemplatesByCategory(): Record<string, MathTemplate[]> {
  return mathTemplates.reduce((acc, template) => {
    if (!acc[template.category]) {
      acc[template.category] = [];
    }
    acc[template.category].push(template);
    return acc;
  }, {} as Record<string, MathTemplate[]>);
}

/**
 * Get a template by name
 */
export function getTemplateByName(name: string): MathTemplate | undefined {
  return mathTemplates.find((t) => t.name === name);
}

/**
 * Get all category names
 */
export function getCategories(): string[] {
  return [...new Set(mathTemplates.map((t) => t.category))];
}
