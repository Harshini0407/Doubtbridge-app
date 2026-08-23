import { BoardId, GradeId, KnowledgeChunk, SubjectOption } from '../types';

// Full supported class range for registration, login, and the doubt-solving selector.
// NOTE: The grounded knowledge base (KNOWLEDGE_BASE below) currently only has authored
// textbook content for Class 9 & 10. Classes 5-8 are fully supported for accounts,
// login, and the Teacher Hub, but the AI doubt-solver will fall back to a
// "not found in textbook" response for 5-8 until that content is added.
export const GRADE_OPTIONS: GradeId[] = ['Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10'];

export const SUBJECTS: SubjectOption[] = [
  // NCERT Subjects (Class 9 & 10)
  {
    id: 'ncert-science',
    name: 'Science',
    board: 'NCERT',
    grades: ['Class 9', 'Class 10'],
    iconName: 'Atom',
    description: 'Physics, Chemistry, and Biology combined syllabus',
  },
  {
    id: 'ncert-math',
    name: 'Mathematics',
    board: 'NCERT',
    grades: ['Class 9', 'Class 10'],
    iconName: 'Calculator',
    description: 'Algebra, Geometry, Trigonometry, and Statistics',
  },
  {
    id: 'ncert-social',
    name: 'Social Science',
    board: 'NCERT',
    grades: ['Class 9', 'Class 10'],
    iconName: 'Globe2',
    description: 'History, Democratic Politics, Geography, and Economics',
  },
  {
    id: 'ncert-english',
    name: 'English Language & Literature',
    board: 'NCERT',
    grades: ['Class 9', 'Class 10'],
    iconName: 'BookOpen',
    description: 'Prose, Poetry, Reading Comprehension & Applied Grammar',
  },

  // TSCERT Subjects (Class 9 & 10)
  {
    id: 'tscert-physics',
    name: 'Physical Science',
    board: 'TSCERT',
    grades: ['Class 9', 'Class 10'],
    iconName: 'Zap',
    description: 'Physics and Chemistry curriculum for Telangana Board',
  },
  {
    id: 'tscert-biology',
    name: 'Biological Science',
    board: 'TSCERT',
    grades: ['Class 9', 'Class 10'],
    iconName: 'Dna',
    description: 'Living organisms, physiology, genetics, and ecology',
  },
  {
    id: 'tscert-math',
    name: 'Mathematics',
    board: 'TSCERT',
    grades: ['Class 9', 'Class 10'],
    iconName: 'Calculator',
    description: 'Number theory, Coordinate Geometry, Polynomials & Trigonometry',
  },
  {
    id: 'tscert-social',
    name: 'Social Studies',
    board: 'TSCERT',
    grades: ['Class 9', 'Class 10'],
    iconName: 'Landmark',
    description: 'Our Earth, Production & Employment, Democracy & Heritage',
  },
  {
    id: 'tscert-english',
    name: 'English',
    board: 'TSCERT',
    grades: ['Class 9', 'Class 10'],
    iconName: 'BookOpen',
    description: 'Telangana State SSC English Reader and Grammar',
  },
];

export const KNOWLEDGE_BASE: KnowledgeChunk[] = [
  // ========================== NCERT CLASS 9 ==========================
  {
    id: 'ncert-sci-9-atoms',
    board: 'NCERT',
    subject: 'Science',
    grade: 'Class 9',
    textbook: 'NCERT Science — Class 9',
    chapter: 'Chapter 3: Atoms and Molecules',
    section: '3.2 Atomic Mass & Law of Chemical Combination',
    keywords: ['atom', 'atomic mass', 'molecule', 'element', 'mole', 'proton', 'neutron', 'dalton', 'valency', 'chemical formula'],
    content: 'An atom is the smallest particle of an element that can take part in a chemical reaction. Atoms are extremely small and are measured in atomic mass units (u), where 1 u is defined as exactly 1/12th the mass of one carbon-12 atom. Molecules form when two or more atoms bond together. The Law of Conservation of Mass states that mass can neither be created nor destroyed in a chemical reaction. The Law of Constant Proportions states that in a chemical substance, elements are always present in definite proportions by mass (e.g., in water H2O, hydrogen and oxygen ratio by mass is always 1:8).',
    keyFormulas: ['1 u = 1/12 × mass of C-12 atom', 'Number of moles (n) = Given mass (m) / Molar mass (M) = Number of particles (N) / Avogadro Number (N₀)', 'N₀ = 6.022 × 10²³ particles/mol'],
    summaryPoints: ['Atoms of same element have identical chemical properties.', 'Valency is the combining capacity of an atom.', 'Polyatomic ions act as single units in formula writing.']
  },
  {
    id: 'ncert-sci-9-motion',
    board: 'NCERT',
    subject: 'Science',
    grade: 'Class 9',
    textbook: 'NCERT Science — Class 9',
    chapter: 'Chapter 8: Motion',
    section: '8.5 Equations of Uniformly Accelerated Motion',
    keywords: ['motion', 'velocity', 'speed', 'acceleration', 'distance', 'displacement', 'uniform motion', 'graph'],
    content: 'Motion is the change in position of an object with respect to time. Distance is the total path length traveled (scalar), while displacement is the shortest distance between initial and final points (vector). Speed = Distance / Time. Velocity = Displacement / Time. Acceleration (a) is the rate of change of velocity: a = (v - u) / t. For uniformly accelerated straight-line motion, three foundational equations connect initial velocity (u), final velocity (v), acceleration (a), time (t), and displacement (s): 1) v = u + at, 2) s = ut + 0.5·a·t², 3) v² = u² + 2as.',
    keyFormulas: ['v = u + at', 's = ut + (1/2)at²', 'v² = u² + 2as', 'Average velocity = (u + v) / 2'],
    summaryPoints: ['Slope of distance-time graph gives speed.', 'Slope of velocity-time graph gives acceleration.', 'Area under velocity-time graph gives displacement.']
  },
  {
    id: 'ncert-sci-9-cell',
    board: 'NCERT',
    subject: 'Science',
    grade: 'Class 9',
    textbook: 'NCERT Science — Class 9',
    chapter: 'Chapter 5: The Fundamental Unit of Life',
    section: '5.2 Cell Structure & Organelles',
    keywords: ['cell', 'membrane', 'nucleus', 'mitochondria', 'plastids', 'osmosis', 'prokaryotic', 'eukaryotic', 'ribosome', 'golgi apparatus'],
    content: 'The cell is the basic structural and functional unit of life, discovered by Robert Hooke in 1665. The plasma membrane is selectively permeable and regulates transport via diffusion and osmosis. Plant cells have an outer rigid cellulose cell wall, large central vacuoles, and chloroplasts for photosynthesis. Animal cells lack cell walls and chloroplasts. The nucleus contains chromosomes made of DNA and proteins. Mitochondria are the powerhouse of the cell generating ATP through cellular respiration.',
    keyFormulas: ['ATP = Adenosine Triphosphate (Energy currency)', 'Osmosis = Movement of water from high water potential to low water potential through semi-permeable membrane'],
    summaryPoints: ['Prokaryotes lack a membrane-bound nucleus and organelles.', 'Lysosomes are suicide bags containing digestive enzymes.', 'Endoplasmic reticulum synthesizes lipids (SER) and proteins (RER).']
  },
  {
    id: 'ncert-math-9-numbers',
    board: 'NCERT',
    subject: 'Mathematics',
    grade: 'Class 9',
    textbook: 'NCERT Mathematics — Class 9',
    chapter: 'Chapter 1: Number Systems',
    section: '1.3 Real Numbers and Decimal Expansions',
    keywords: ['rational', 'irrational', 'real number', 'decimal expansion', 'terminating', 'non-terminating', 'number line', 'surds', 'rationalisation'],
    content: 'A rational number can be expressed as p/q where p and q are integers and q ≠ 0. Its decimal expansion is either terminating (e.g., 0.75 = 3/4) or non-terminating repeating (e.g., 0.333... = 1/3). An irrational number cannot be written as p/q; its decimal expansion is non-terminating and non-repeating (e.g., √2, √3, π). Real numbers comprise all rationals and irrationals. To rationalise a binomial denominator like 1/(a + √b), multiply numerator and denominator by the conjugate (a - √b).',
    keyFormulas: ['p/q form where q ≠ 0', '(a + √b)(a - √b) = a² - b', 'aᵐ × aⁿ = aᵐ⁺ⁿ', '(aᵐ)ⁿ = aᵐⁿ'],
    summaryPoints: ['Sum or product of a non-zero rational and an irrational is always irrational.', 'Every real number corresponds to a unique point on the number line.']
  },
  {
    id: 'ncert-math-9-polynomials',
    board: 'NCERT',
    subject: 'Mathematics',
    grade: 'Class 9',
    textbook: 'NCERT Mathematics — Class 9',
    chapter: 'Chapter 2: Polynomials',
    section: '2.4 Factorisation of Polynomials & Remainder Theorem',
    keywords: ['polynomial', 'degree', 'zeroes', 'factor theorem', 'remainder theorem', 'algebraic identities', 'splitting middle term'],
    content: 'A polynomial p(x) in one variable x is an algebraic expression with whole number exponents. Degree is the highest power of x. Linear polynomial (degree 1), quadratic (degree 2), cubic (degree 3). Remainder Theorem: When p(x) is divided by (x - a), the remainder is p(a). Factor Theorem: (x - a) is a factor of p(x) if and only if p(a) = 0. Quadratic polynomials ax² + bx + c are factorised by splitting the middle term into two numbers whose sum is b and product is a·c.',
    keyFormulas: ['(x + y)² = x² + 2xy + y²', '(x - y)² = x² - 2xy + y²', 'x² - y² = (x - y)(x + y)', '(x + a)(x + b) = x² + (a + b)x + ab', '(x + y + z)² = x² + y² + z² + 2xy + 2yz + 2zx'],
    summaryPoints: ['A polynomial of degree n has at most n zeroes.', 'p(a) = 0 means a is a root or zero of the polynomial.']
  },
  {
    id: 'ncert-soc-9-democracy',
    board: 'NCERT',
    subject: 'Social Science',
    grade: 'Class 9',
    textbook: 'NCERT Democratic Politics-I — Class 9',
    chapter: 'Chapter 2: What is Democracy? Why Democracy?',
    section: '2.2 Features of Democracy',
    keywords: ['democracy', 'elections', 'universal adult franchise', 'rule of law', 'constitution', 'fundamental rights', 'citizens'],
    content: 'Democracy is a form of government in which rulers are elected by the people. Key features include: 1) Major decisions are made by elected leaders; 2) Elections offer a free, fair, and regular choice to change current rulers; 3) Universal adult franchise where each adult citizen has one vote and each vote has one value; 4) The government rules within limits set by constitutional law and citizens rights. Democracy improves decision quality and provides methods to resolve conflicts peacefully.',
    keyFormulas: ['One person, one vote, one value', 'Article 326 of Indian Constitution grants Universal Adult Suffrage'],
    summaryPoints: ['Democracy is better than other forms because it allows correcting mistakes.', 'It enhances the dignity of citizens.']
  },

  // ========================== NCERT CLASS 10 ==========================
  {
    id: 'ncert-sci-10-light',
    board: 'NCERT',
    subject: 'Science',
    grade: 'Class 10',
    textbook: 'NCERT Science — Class 10',
    chapter: 'Chapter 10: Light — Reflection and Refraction',
    section: '10.2 Spherical Mirrors, Lens Formula & Refractive Index',
    keywords: ['light', 'reflection', 'refraction', 'concave mirror', 'convex mirror', 'concave lens', 'convex lens', 'focal length', 'snell law', 'power of lens', 'magnification'],
    content: 'Curved mirrors follow laws of reflection: angle of incidence equals angle of reflection. A concave mirror converges parallel rays to a real focus (used in solar furnaces, shaving mirrors, car headlights). A convex mirror diverges rays, creating an erect, diminished virtual image with a wide field of view (used in rear-view mirrors). Mirror Formula: 1/f = 1/v + 1/u. Refraction is the bending of light across medium boundaries according to Snell\'s law: sin(i) / sin(r) = n₂ / n₁. Lens Formula: 1/f = 1/v - 1/u. Power of lens P = 1/f (in meters), measured in Dioptres (D).',
    keyFormulas: ['Mirror formula: 1/f = 1/v + 1/u', 'Lens formula: 1/f = 1/v - 1/u', 'Magnification m = -v/u (mirror) = +v/u (lens) = h\'/h', 'Power P = 1 / f(in meters) [Unit: Dioptre D]', 'Snell\'s Law: n = sin(i) / sin(r) = c / v'],
    summaryPoints: ['Concave mirror produces both real/inverted and virtual/erect images depending on object position.', 'Convex lens is converging; concave lens is diverging.', 'Sign convention: distances in direction of incident ray are positive, opposite are negative.']
  },
  {
    id: 'ncert-sci-10-reactions',
    board: 'NCERT',
    subject: 'Science',
    grade: 'Class 10',
    textbook: 'NCERT Science — Class 10',
    chapter: 'Chapter 1: Chemical Reactions and Equations',
    section: '1.2 Types of Chemical Reactions',
    keywords: ['chemical reaction', 'combination', 'decomposition', 'displacement', 'double displacement', 'redox', 'oxidation', 'reduction', 'corrosion', 'rancidity'],
    content: 'A chemical reaction involves breaking old bonds and making new ones. Types of reactions: 1) Combination: Two or more reactants form one product (CaO + H2O → Ca(OH)2 + Heat). 2) Decomposition: Single reactant breaks down under heat, light, or electricity (2FeSO4 → Fe2O3 + SO2 + SO3). 3) Displacement: A more reactive metal displaces a less reactive metal from its salt solution (Fe + CuSO4 → FeSO4 + Cu). 4) Double Displacement: Exchange of ions between compounds forming a precipitate (Na2SO4 + BaCl2 → BaSO4↓ + 2NaCl). 5) Redox: Simultaneous oxidation (gain of oxygen / loss of electrons) and reduction (loss of oxygen / gain of electrons).',
    keyFormulas: ['Oxidation = Gain of O or Loss of H / e⁻', 'Reduction = Loss of O or Gain of H / e⁻', 'Respiration is an exothermic decomposition process'],
    summaryPoints: ['Balancing chemical equations obeys the Law of Conservation of Mass.', 'Precipitation reactions yield insoluble solid salts.', 'Antioxidants prevent rancidity in fatty foods.']
  },
  {
    id: 'ncert-sci-10-electricity',
    board: 'NCERT',
    subject: 'Science',
    grade: 'Class 10',
    textbook: 'NCERT Science — Class 10',
    chapter: 'Chapter 12: Electricity',
    section: '12.2 Ohm\'s Law, Resistance in Series and Parallel, Joule\'s Heating',
    keywords: ['electricity', 'current', 'potential difference', 'ohms law', 'resistance', 'resistivity', 'series', 'parallel', 'joule heating', 'electric power', 'kilowatt-hour'],
    content: 'Electric current (I) is the rate of flow of electric charges: I = Q / t (Amperes). Potential difference (V) is the work done per unit charge: V = W / Q (Volts). Ohm\'s Law states that at constant temperature, current through a metallic conductor is directly proportional to potential difference across its ends: V = I·R. Resistance R = ρ·(L / A), where ρ is resistivity. In series: R_total = R1 + R2 + R3. In parallel: 1/R_total = 1/R1 + 1/R2 + 1/R3. Joule\'s Heating Law: H = I²·R·t. Electric Power P = V·I = I²·R = V²/R. 1 kWh = 3.6 × 10⁶ Joules.',
    keyFormulas: ['V = I × R', 'R = ρ × (L / A)', 'Series: R_s = R₁ + R₂ + R₃', 'Parallel: 1/R_p = 1/R₁ + 1/R₂ + 1/R₃', 'Heat H = I²Rt', 'Power P = VI = I²R = V²/R', '1 kWh = 3.6 × 10⁶ J (1 commercial unit)'],
    summaryPoints: ['Ammeter is connected in series; voltmeter in parallel.', 'Parallel circuits maintain uniform potential difference across devices.', 'Fuse wire has low melting point and prevents circuit overload.']
  },
  {
    id: 'ncert-math-10-quadratics',
    board: 'NCERT',
    subject: 'Mathematics',
    grade: 'Class 10',
    textbook: 'NCERT Mathematics — Class 10',
    chapter: 'Chapter 4: Quadratic Equations',
    section: '4.3 Factorisation, Quadratic Formula & Nature of Roots',
    keywords: ['quadratic equation', 'roots', 'factorisation', 'quadratic formula', 'discriminant', 'nature of roots', 'real roots', 'b2-4ac'],
    content: 'A quadratic equation in variable x is of the form ax² + bx + c = 0, where a, b, c are real numbers and a ≠ 0. The solutions are called roots or zeroes. Quadratic Formula (Sridharacharya Formula): x = [-b ± √(b² - 4ac)] / (2a). The discriminant D = b² - 4ac determines the nature of roots: 1) If D > 0, there are two distinct real roots; 2) If D = 0, there are two equal real roots (x = -b / 2a); 3) If D < 0, there are no real roots. Sum of roots α + β = -b/a, product of roots α·β = c/a.',
    keyFormulas: ['x = [-b ± √(b² - 4ac)] / (2a)', 'Discriminant D = b² - 4ac', 'D > 0: 2 distinct real roots', 'D = 0: 2 equal real roots', 'D < 0: No real roots', 'α + β = -b/a, αβ = c/a'],
    summaryPoints: ['Quadratic equations always have at most two roots.', 'Graph of a quadratic function is a parabola.', 'Word problems can be solved by translating given conditions into standard ax² + bx + c = 0.']
  },
  {
    id: 'ncert-math-10-trig',
    board: 'NCERT',
    subject: 'Mathematics',
    grade: 'Class 10',
    textbook: 'NCERT Mathematics — Class 10',
    chapter: 'Chapter 8: Introduction to Trigonometry',
    section: '8.4 Trigonometric Identities and Specific Angle Values',
    keywords: ['trigonometry', 'sine', 'cosine', 'tangent', 'cosec', 'secant', 'cotangent', 'identities', 'sin2+cos2=1', 'heights and distances', 'right triangle'],
    content: 'Trigonometric ratios relate the acute angles of a right triangle to its side lengths. For angle θ: sin θ = Opposite / Hypotenuse, cos θ = Adjacent / Hypotenuse, tan θ = Opposite / Adjacent = sin θ / cos θ, cosec θ = 1 / sin θ, sec θ = 1 / cos θ, cot θ = 1 / tan θ. Specific values: sin 0°=0, sin 30°=1/2, sin 45°=1/√2, sin 60°=√3/2, sin 90°=1; cos is reversed. Core identities: 1) sin² θ + cos² θ = 1, 2) 1 + tan² θ = sec² θ, 3) 1 + cot² θ = cosec² θ.',
    keyFormulas: ['sin² θ + cos² θ = 1', 'sec² θ - tan² θ = 1', 'cosec² θ - cot² θ = 1', 'tan θ = sin θ / cos θ', 'sin(90° - θ) = cos θ, cos(90° - θ) = sin θ'],
    summaryPoints: ['Values of sin θ and cos θ never exceed 1.', 'Trigonometric identities hold true for all angle values 0° ≤ θ ≤ 90°.']
  },
  {
    id: 'ncert-math-10-triangles',
    board: 'NCERT',
    subject: 'Mathematics',
    grade: 'Class 10',
    textbook: 'NCERT Mathematics — Class 10',
    chapter: 'Chapter 6: Triangles',
    section: '6.2 Basic Proportionality Theorem (Thales Theorem) & Similarity Criteria',
    keywords: ['triangles', 'similarity', 'congruence', 'BPT', 'thales theorem', 'AAA', 'SSS', 'SAS', 'pythagoras theorem', 'ratio of areas'],
    content: 'Two polygons are similar if their corresponding angles are equal and corresponding sides are in the same ratio. Basic Proportionality Theorem (BPT / Thales Theorem): If a line is drawn parallel to one side of a triangle to intersect the other two sides in distinct points, the other two sides are divided in the same ratio (AD/DB = AE/EC). Criteria for similarity of triangles: AAA (or AA), SSS, and SAS similarity. Ratio of areas of two similar triangles is equal to the square of the ratio of their corresponding sides.',
    keyFormulas: ['BPT: AD/DB = AE/EC when DE || BC', 'Area(ΔABC)/Area(ΔPQR) = (AB/PQ)² = (BC/QR)² = (AC/PR)²', 'Pythagoras: AC² = AB² + BC² in right ΔABC with ∠B = 90°'],
    summaryPoints: ['All congruent figures are similar, but similar figures need not be congruent.', 'AA similarity requires only two pairs of corresponding angles to be equal.']
  },

  // ========================== TSCERT CLASS 9 ==========================
  {
    id: 'tscert-phys-9-motion',
    board: 'TSCERT',
    subject: 'Physical Science',
    grade: 'Class 9',
    textbook: 'TSCERT Physical Science — Class 9',
    chapter: 'Chapter 2: Motion',
    section: '2.4 Uniform Acceleration & Graphical Representation',
    keywords: ['motion', 'velocity', 'acceleration', 'equations of motion', 'displacement', 'scalar', 'vector', 'speedometer'],
    content: 'Motion is relative to the observer and frame of reference. Speed is rate of distance covered, velocity is displacement per unit time. When an object accelerates at a uniform rate (a), its motion is described by the equations: v = u + at, s = ut + 0.5·a·t², and v² - u² = 2as. The slope of a position-time graph gives velocity, while the area under a velocity-time graph gives the total displacement traversed during time interval t.',
    keyFormulas: ['v = u + at', 's = ut + (1/2)at²', 'v² = u² + 2as', 'a = (v - u) / t'],
    summaryPoints: ['Zero acceleration means uniform velocity.', 'Deceleration/retardation is negative acceleration.']
  },
  {
    id: 'tscert-phys-9-matter',
    board: 'TSCERT',
    subject: 'Physical Science',
    grade: 'Class 9',
    textbook: 'TSCERT Physical Science — Class 9',
    chapter: 'Chapter 1: Matter Around Us',
    section: '1.3 States of Matter & Phase Change',
    keywords: ['matter', 'solid', 'liquid', 'gas', 'evaporation', 'latent heat', 'diffusion', 'temperature', 'pressure'],
    content: 'Matter is made up of tiny particles having mass and volume. Particles possess kinetic energy which increases with temperature. Solid particles vibrate in fixed lattice points; liquid particles slide past one another; gas particles move randomly at high speeds with negligible intermolecular attraction. Latent heat of fusion is energy required to convert 1 kg solid to liquid at melting point without temperature rise. Latent heat of vaporization is energy required to convert 1 kg liquid to gas at boiling point. Evaporation causes cooling because high-energy particles escape the surface.',
    keyFormulas: ['Kelvin (K) = Celsius (°C) + 273.15', 'Density = Mass / Volume (kg/m³)'],
    summaryPoints: ['Sublimation is direct transition from solid to gas (e.g., Camphor, Dry Ice).', 'Humidity, temperature, surface area, and wind speed affect evaporation rate.']
  },
  {
    id: 'tscert-bio-9-cell',
    board: 'TSCERT',
    subject: 'Biological Science',
    grade: 'Class 9',
    textbook: 'TSCERT Biological Science — Class 9',
    chapter: 'Chapter 1: Cell — The Basic Unit of Life',
    section: '1.2 Organelles & Cell Division',
    keywords: ['cell', 'nucleus', 'mitochondria', 'chloroplast', 'mitosis', 'meiosis', 'vacuole', 'cell wall', 'cytoplasm'],
    content: 'Every organism begins life as a single cell. Cells contain specialized organelles suspended in cytosol. Mitochondria carry out Krebs cycle and oxidative phosphorylation to generate ATP. Chloroplasts contain chlorophyll thylakoids where sunlight is captured during light-dependent photosynthesis reactions. Plant cells are protected by rigid cellulose cell walls. Somatic cell division occurs via mitosis yielding 2 identical diploid (2n) daughter cells. Gamete formation occurs via meiosis yielding 4 genetically varied haploid (n) cells.',
    keyFormulas: ['Photosynthesis: 6CO2 + 12H2O + Sunlight → C6H12O6 + 6O2 + 6H2O', 'Mitosis: 1 mother cell (2n) → 2 daughter cells (2n)', 'Meiosis: 1 mother cell (2n) → 4 daughter cells (n)'],
    summaryPoints: ['Cell membrane exhibits fluid mosaic model.', 'Ribosomes are protein factories without membrane boundaries.']
  },
  {
    id: 'tscert-math-9-polynomials',
    board: 'TSCERT',
    subject: 'Mathematics',
    grade: 'Class 9',
    textbook: 'TSCERT Mathematics — Class 9',
    chapter: 'Chapter 3: Polynomials',
    section: '3.3 Zeroes and Factorisation of Algebraic Expressions',
    keywords: ['polynomial', 'zero of polynomial', 'coefficient', 'degree', 'synthetic division', 'remainder theorem'],
    content: 'A polynomial is an algebraic expression P(x) = aₙxⁿ + aₙ₋₁xⁿ⁻¹ + ... + a₁x + a₀ where exponents are non-negative integers. The value k is a zero of P(x) if P(k) = 0. A linear polynomial has 1 zero, quadratic has up to 2 zeroes, cubic has up to 3 zeroes. Factor Theorem states that (x - a) divides P(x) completely without remainder if P(a) = 0. Algebraic identities help simplify products and factorise polynomials quickly.',
    keyFormulas: ['(a + b)³ = a³ + 3a²b + 3ab² + b³ = a³ + b³ + 3ab(a + b)', '(a - b)³ = a³ - 3a²b + 3ab² - b³ = a³ - b³ - 3ab(a - b)', 'a³ + b³ + c³ - 3abc = (a + b + c)(a² + b² + c² - ab - bc - ca)'],
    summaryPoints: ['If a + b + c = 0, then a³ + b³ + c³ = 3abc.', 'Zero polynomial has undefined degree.']
  },

  // ========================== TSCERT CLASS 10 ==========================
  {
    id: 'tscert-phys-10-reactions',
    board: 'TSCERT',
    subject: 'Physical Science',
    grade: 'Class 10',
    textbook: 'TSCERT Physical Science — Class 10',
    chapter: 'Chapter 1: Chemical Reactions and Equations',
    section: '1.2 Types of Reactions, Oxidation & Reduction',
    keywords: ['chemical reactions', 'equations', 'combination', 'decomposition', 'displacement', 'double displacement', 'redox', 'corrosion', 'rancidity'],
    content: 'Chemical reactions are representations of chemical changes. A balanced equation reflects the Law of Conservation of Mass. Reactions are classified into: Combination (A + B → AB), Decomposition (AB → A + B), Displacement (A + BC → AC + B), and Double Displacement (AB + CD → AD + CB). Oxidation is gain of oxygen or loss of electrons; reduction is loss of oxygen or gain of electrons. Corrosion of iron (rusting) produces hydrated iron(III) oxide Fe2O3·xH2O when exposed to air and moisture.',
    keyFormulas: ['2Mg + O2 → 2MgO (Combination)', 'CaCO3 + Heat → CaO + CO2 (Thermal decomposition)', 'Zn + H2SO4 → ZnSO4 + H2↑ (Displacement)'],
    summaryPoints: ['Rusting requires both oxygen and water.', 'Galvanization coats iron with zinc to prevent oxidation.']
  },
  {
    id: 'tscert-phys-10-refraction',
    board: 'TSCERT',
    subject: 'Physical Science',
    grade: 'Class 10',
    textbook: 'TSCERT Physical Science — Class 10',
    chapter: 'Chapter 4: Refraction of Light at Curved Surfaces',
    section: '4.2 Lens Maker Formula, Focal Length & Ray Diagrams',
    keywords: ['refraction', 'lenses', 'focal length', 'lens maker formula', 'magnification', 'convex lens', 'concave lens', 'optical centre', 'critical angle', 'total internal reflection'],
    content: 'When light passes between optically different media, it bends according to Snell\'s law. Refractive index n = c / v = sin(i) / sin(r). For lenses, the Lens Maker\'s formula connects refractive index (n) of lens material with radii of curvature (R1, R2): 1/f = (n - 1)·[1/R1 - 1/R2]. Lens formula is 1/f = 1/v - 1/u with sign convention. When light travels from denser to rarer medium at an angle greater than the critical angle, Total Internal Reflection (TIR) occurs (principles behind optical fibres and diamond sparkle).',
    keyFormulas: ['Lens Maker: 1/f = (n - 1)(1/R₁ - 1/R₂)', 'Lens Formula: 1/f = 1/v - 1/u', 'Critical Angle: sin(C) = 1 / n', 'Magnification: m = v / u = h\' / h'],
    summaryPoints: ['Convex lens is thicker in middle, converges light.', 'Concave lens is thinner in middle, diverges light.', 'Focal length is positive for convex lens, negative for concave lens.']
  },
  {
    id: 'tscert-bio-10-heredity',
    board: 'TSCERT',
    subject: 'Biological Science',
    grade: 'Class 10',
    textbook: 'TSCERT Biological Science — Class 10',
    chapter: 'Chapter 8: Heredity — From Parent to Progeny',
    section: '8.1 Mendel\'s Principles of Inheritance & Sex Determination',
    keywords: ['heredity', 'genetics', 'mendel', 'dominant', 'recessive', 'monohybrid cross', 'dihybrid cross', 'phenotype', 'genotype', 'dna', 'chromosomes', 'sex determination'],
    content: 'Heredity is the transmission of traits from parents to offspring. Gregor Johann Mendel conducted hybridization experiments on garden pea (Pisum sativum). In a Monohybrid cross (e.g., Tall TT × Dwarf tt), F1 generation is all Tall (Tt). In F2 generation, phenotypic ratio is 3:1 (3 Tall : 1 Dwarf) and genotypic ratio is 1:2:1 (1 TT : 2 Tt : 1 tt). Law of Dominance states dominant alleles express over recessive. Law of Segregation states allele pairs separate during gamete formation. In humans, sex is determined chromosomally: females have XX, males have XY. Father\'s sperm (X or Y) decides the biological sex.',
    keyFormulas: ['Monohybrid F2 Phenotypic Ratio = 3:1', 'Monohybrid F2 Genotypic Ratio = 1:2:1', 'Dihybrid F2 Phenotypic Ratio = 9:3:3:1', 'Human chromosomes = 23 pairs (22 autosomes + 1 sex chromosome pair)'],
    summaryPoints: ['Phenotype is physical appearance; genotype is genetic makeup.', 'All human eggs carry an X chromosome; sperm carry either X or Y.']
  },
  {
    id: 'tscert-math-10-trig',
    board: 'TSCERT',
    subject: 'Mathematics',
    grade: 'Class 10',
    textbook: 'TSCERT Mathematics — Class 10',
    chapter: 'Chapter 11: Trigonometry',
    section: '11.1 Trigonometric Ratios, Values & Standard Identities',
    keywords: ['trigonometry', 'sine', 'cosine', 'tangent', 'ratios', 'identities', 'right triangle', 'complementary angles', 'secant', 'cosecant', 'cotangent'],
    content: 'Trigonometry is the branch of mathematics dealing with relationships between side lengths and angles of triangles. In right triangle ABC with right angle at B: sin A = opposite/hypotenuse = BC/AC; cos A = adjacent/hypotenuse = AB/AC; tan A = BC/AB. Reciprocals: cosec A = 1/sin A, sec A = 1/cos A, cot A = 1/tan A. Standard Pythagorean identities: 1) sin² A + cos² A = 1; 2) sec² A - tan² A = 1; 3) cosec² A - cot² A = 1. Complementary angles: sin(90° - A) = cos A, tan(90° - A) = cot A.',
    keyFormulas: ['sin² θ + cos² θ = 1', 'sec² θ - tan² θ = 1', 'cosec² θ - cot² θ = 1', 'tan θ = sin θ / cos θ', 'cot θ = cos θ / sin θ'],
    summaryPoints: ['Trigonometric ratios are dimensionless numbers.', 'Values of sin θ increase from 0 to 1 as θ increases from 0° to 90°.']
  }
];

export const FREQUENT_DOUBT_PROMPTS: Record<string, string[]> = {
  'Mathematics': [
    'How do I split the middle term in quadratic equations step by step?',
    'What is the difference between rational and irrational numbers?',
    'Can you explain sin, cos, and tan with a simple triangle diagram?',
    'How do I prove the Basic Proportionality Theorem (Thales theorem)?',
    'Why is the degree of a zero polynomial undefined?',
  ],
  'Science': [
    'Why do convex mirrors have a wider field of view than flat mirrors?',
    'How do I calculate atomic mass and write molecular formulas?',
    'Explain the 3 equations of motion and when to use each.',
    'What is the difference between combination and displacement reactions?',
    'Why are mitochondria called the powerhouse of the cell?',
  ],
  'Physical Science': [
    'How do I balance a chemical equation step by step?',
    'Explain the difference between velocity and acceleration with examples.',
    'What is Ohm’s law and how do series and parallel resistors differ?',
    'How does total internal reflection work in optical fibres?',
  ],
  'Biological Science': [
    'Explain Mendel’s monohybrid cross and the 3:1 phenotypic ratio.',
    'How is the sex of a human child determined genetically?',
    'What is the difference between plant and animal cells?',
    'Explain the difference between mitosis and meiosis.',
  ],
  'Social Science': [
    'What are the core features that define a true democracy?',
    'Why is universal adult franchise essential for equality?',
    'Explain the three sectors of Indian economy (Primary, Secondary, Tertiary).',
  ],
  'English': [
    'How do I identify active vs passive voice in secondary grammar?',
    'What is the structure of a formal letter to an editor?',
    'Explain subject-verb agreement rules with examples.',
  ]
};
