// Pre-loaded study notes for instant quizzing and testing

export const SAMPLE_NOTES = [
  {
    id: "operating-systems",
    title: "Operating Systems & Concurrency",
    category: "Computer Science",
    tags: ["OS", "Concurrency", "Memory", "Processes"],
    content: `# Operating Systems & Concurrency Notes

## 1. Processes vs Threads
- A **Process** is an executing program instance with its own isolated virtual address space, file descriptors, and security context.
- A **Thread** is the smallest unit of CPU execution within a process. Threads in the same process share code, data, and open files, but each thread has its own program counter, registers, and private stack.
- Switching between processes incurs higher overhead (TLB flushes, cache invalidations) than context switching between threads within the same address space.

## 2. Race Conditions & Critical Sections
- A **critical section** is a code segment that accesses shared mutable state. If multiple threads enter without coordination, non-deterministic bugs occur.
- **Mutual Exclusion**: Ensures only one thread executes a critical section at any given moment.
- **Mutex (Mutual Exclusion lock)**: A synchronization primitive with ownership semantics. Only the thread that acquired the mutex may release it.
- **Semaphore**: A synchronization primitive maintaining an integer counter.
  - *Counting semaphore*: Controls access to a finite pool of resources.
  - *Binary semaphore*: Functions similarly to a lock, but lacks thread-ownership restrictions.

## 3. Deadlock Requirements (Coffman Conditions)
All four conditions must hold simultaneously for a deadlock to occur:
1. **Mutual Exclusion**: At least one resource is held in a non-shareable mode.
2. **Hold and Wait**: A process currently holding at least one resource is waiting to acquire additional resources held by other processes.
3. **No Preemption**: Resources cannot be forcibly revoked from a process; they must be released voluntarily.
4. **Circular Wait**: A closed chain of processes exists such that each process holds a resource needed by the next process in the chain.

## 4. Virtual Memory & Paging
- **Virtual Memory** creates the illusion of a large, contiguous memory space, isolating processes from one another and physical RAM limitations.
- Physical memory is divided into fixed-size chunks called **Page Frames** (typically 4 KB).
- Virtual addresses are translated to physical addresses by the **MMU (Memory Management Unit)** using **Page Tables**.
- The **TLB (Translation Lookaside Buffer)** is an ultra-fast hardware cache for recent virtual-to-physical address mappings. A TLB miss triggers a hardware or software page table walk.
- **Page Fault**: An interrupt raised by hardware when a thread accesses a virtual memory page not currently mapped into physical RAM (e.g. swapped out to disk or lazily allocated).`
  },
  {
    id: "cell-biology",
    title: "Cellular Biology & Genetics",
    category: "Biology",
    tags: ["Cells", "Genetics", "DNA", "Mitosis"],
    content: `# Cellular Biology & Molecular Genetics

## 1. Cell Organelles & Functions
- **Nucleus**: Houses chromatin (genomic DNA bound to histones) and orchestrates gene transcription and RNA processing.
- **Mitochondria**: The metabolic powerhouses of eukaryotic cells. They generate ATP through oxidative phosphorylation across the inner mitochondrial membrane and possess their own circular DNA (mtDNA) inherited maternally.
- **Ribosomes**: Macromolecular machines composed of ribosomal RNA (rRNA) and proteins that translate mRNA transcripts into polypeptide chains.
- **Endoplasmic Reticulum (ER)**:
  - *Rough ER*: Studded with ribosomes; synthesizes membrane and secreted proteins.
  - *Smooth ER*: Synthesizes lipids and phospholipids, metabolizes carbohydrates, and detoxifies chemicals.
- **Golgi Apparatus**: Modifies, sorts, and packages glycoproteins and lipids into secretory vesicles.

## 2. Central Dogma of Molecular Biology
1. **Replication**: DNA polymerases synthesize duplicate copies of the double-stranded DNA helix during the S-phase of the cell cycle.
2. **Transcription**: RNA polymerase transcribes genomic DNA into messenger RNA (mRNA) inside the nucleus.
3. **Translation**: Ribosomes decode triplet mRNA codons into amino acids brought by transfer RNAs (tRNAs).
- *Exceptions*: Reverse transcriptase in retroviruses (synthesizing DNA from RNA) and RNA replication in certain viruses.

## 3. Mitosis vs Meiosis
- **Mitosis**: A single round of division producing two genetically identical diploid (2n) somatic cells. Crucial for tissue repair and growth.
  - Phases: Prophase, Metaphase, Anaphase, Telophase (Cytokinesis).
- **Meiosis**: Two sequential divisions producing four genetically diverse haploid (1n) gametes (sperm or egg).
  - Generates genetic diversity via *crossing over* (homologous recombination during Prophase I) and *independent assortment* of chromosomes during Metaphase I.`
  },
  {
    id: "machine-learning",
    title: "Machine Learning Foundations",
    category: "Artificial Intelligence",
    tags: ["AI", "Loss Functions", "Gradient Descent", "Overfitting"],
    content: `# Machine Learning Foundations

## 1. Core Paradigms
- **Supervised Learning**: Models learn a mapping from input features $X$ to labeled outputs $y$. Examples: Linear Regression, Support Vector Machines, Random Forests, Neural Networks.
- **Unsupervised Learning**: Uncovers latent structure or patterns from unlabeled data. Examples: K-Means clustering, Principal Component Analysis (PCA), Autoencoders.
- **Reinforcement Learning**: An agent interacts with an environment, taking actions to maximize cumulative discounted rewards through trial and error.

## 2. Gradient Descent & Backpropagation
- **Loss Function**: A mathematical function quantifying the discrepancy between model predictions $\hat{y}$ and true ground truth targets $y$ (e.g. Mean Squared Error, Cross-Entropy Loss).
- **Gradient Descent**: An optimization algorithm that iteratively updates model parameters $\\theta$ in the opposite direction of the gradient of the loss function:
  $$\\theta_{t+1} = \\theta_t - \\eta \\nabla L(\\theta_t)$$
  where $\\eta$ is the learning rate.
- **Backpropagation**: An efficient application of the multivariable calculus chain rule to compute partial derivatives $\\frac{\\partial L}{\\partial w}$ for each weight in a deep neural network from the output layer back to the input layer.

## 3. Bias-Variance Tradeoff & Regularization
- **High Bias (Underfitting)**: The model is too simple to capture underlying patterns; exhibits poor performance on both training and validation sets.
- **High Variance (Overfitting)**: The model memorizes training noise and idiosyncrasies; exhibits near-zero training loss but high validation error.
- **Regularization Techniques**:
  - *L1 Regularization (Lasso)*: Adds penalty $\\lambda \\sum |w_i|$, encouraging sparsity (setting unneeded weights to zero).
  - *L2 Regularization (Ridge)*: Adds penalty $\\frac{1}{2}\\lambda \\sum w_i^2$, penalizing large weight magnitudes.
  - *Dropout*: Randomly zeroes out a fraction of neuron activations during training passes, preventing co-adaptation of features.
  - *Early Stopping*: Halts training when validation loss stops improving.`
  },
  {
    id: "industrial-revolution",
    title: "The Industrial Revolution",
    category: "World History",
    tags: ["History", "Economics", "Steam Power", "Society"],
    content: `# The Industrial Revolution (c. 1760 – 1840)

## 1. Origins in Great Britain
The First Industrial Revolution began in Britain due to a confluence of unique geopolitical and natural advantages:
- **Abundant Coal and Iron Ore Deposits**: Readily accessible fossil fuels to power machinery and smelt iron.
- **Agricultural Revolution**: Innovations like the Norfolk four-course crop rotation and selective breeding freed up surplus rural labor for urban industrial factories.
- **Capital Accumulation and Banking**: Sophisticated financial institutions, stable property rights, and colonial trade networks provided ample venture capital.
- **Naval and Commercial Hegemony**: British merchant shipping allowed global raw material acquisition (such as American raw cotton) and captive export markets.

## 2. Key Inventions
- **Steam Engine (James Watt, 1769)**: By adding a separate condenser, Watt vastly improved Thomas Newcomen's primitive atmospheric engine, enabling efficient rotary power anywhere without needing a river waterwheel.
- **Spinning Jenny (James Hargreaves, 1764)**: Enabled a single worker to spin multiple spools of thread simultaneously.
- **Power Loom (Edmund Cartwright, 1785)**: Mechanized weaving, drastically outproducing traditional hand weavers.
- **Locomotives & Railways (George Stephenson's Rocket, 1829)**: Revolutionized overland freight and passenger transit, collapsing travel times and unifying national markets.

## 3. Social and Economic Impacts
- **Mass Urbanization**: Rapid migration from pastoral villages to burgeoning factory cities (Manchester, Birmingham, Leeds) with inadequate sanitation and rampant cholera outbreaks.
- **Rise of the Factory System**: Clock-disciplined labor replaced seasonal agrarian rhythms; long 14-to-16-hour shifts under perilous conditions.
- **Child Labor and Reform**: Widespread employment of children in textile mills and coal mines led to early labor movements and the Factory Acts (1833) regulating working hours.
- **Emergence of Industrial Capitalism**: Cemented the social divide between the bourgeoisie (owners of the means of production) and the proletariat (wage laborers), shaping modern political philosophy.`
  }
];
