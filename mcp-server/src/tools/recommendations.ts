import type { Recommendation } from "../types.js";
import { getTrending } from "./trending.js";

// Comprehensive learning resource database mapped to technology topics (100% Free Materials)
const LEARNING_RESOURCES: Record<string, Omit<Recommendation, "articleCount">> = {
  "artificial intelligence": {
    topic: "Artificial Intelligence & Machine Learning",
    demandLevel: "critical",
    category: "ai",
    description: "AI/ML skills are the #1 most demanded capability in the IT industry. From LLMs to computer vision, companies are hiring aggressively.",
    whyLearn: "AI roles have seen a 300% increase in job postings since 2024. Every major tech company now requires AI literacy.",
    resources: [
      { name: "Stanford CS229: Machine Learning", url: "https://cs229.stanford.edu/", type: "course", free: true },
      { name: "Fast.ai Practical Deep Learning", url: "https://course.fast.ai/", type: "course", free: true },
      { name: "Harvard CS50's AI with Python", url: "https://cs50.harvard.edu/ai/", type: "course", free: true },
      { name: "Google Machine Learning Crash Course", url: "https://developers.google.com/machine-learning/crash-course", type: "tutorial", free: true },
    ],
    relatedJobTitles: ["ML Engineer", "AI Researcher", "Data Scientist", "AI Product Manager"],
    avgSalaryRange: "$130,000 - $250,000",
  },
  "kubernetes": {
    topic: "Kubernetes & Container Orchestration",
    demandLevel: "very-high",
    category: "devops",
    description: "Kubernetes has become the de-facto standard for container orchestration. Mastering K8s is essential for cloud-native development and DevOps roles.",
    whyLearn: "93% of enterprises use Kubernetes in production. K8s proficiency is basically a requirement for modern infrastructure jobs.",
    resources: [
      { name: "Kubernetes Official Docs", url: "https://kubernetes.io/docs/home/", type: "docs", free: true },
      { name: "FreeCodeCamp Kubernetes Course", url: "https://www.youtube.com/watch?v=d6WC5n9G_sM", type: "course", free: true },
      { name: "Kubernetes the Hard Way", url: "https://github.com/kelseyhightower/kubernetes-the-hard-way", type: "tutorial", free: true },
      { name: "EdX Intro to Kubernetes", url: "https://www.edx.org/course/introduction-to-kubernetes", type: "course", free: true },
    ],
    relatedJobTitles: ["DevOps Engineer", "Platform Engineer", "SRE", "Cloud Native Developer"],
    avgSalaryRange: "$120,000 - $190,000",
  },
  "cloud native": {
    topic: "Cloud Computing & Architecture",
    demandLevel: "critical",
    category: "cloud",
    description: "Multi-cloud and cloud-native architectures are the backbone of modern IT.",
    whyLearn: "Cloud computing market is projected to reach $1.5 trillion by 2030. Cloud fundamentals are needed everywhere.",
    resources: [
      { name: "AWS Skill Builder (Free Tier)", url: "https://explore.skillbuilder.aws/learn", type: "course", free: true },
      { name: "Microsoft Learn for Azure", url: "https://learn.microsoft.com/en-us/training/azure/", type: "tutorial", free: true },
      { name: "Google Cloud Skills Boost", url: "https://www.cloudskillsboost.google/", type: "course", free: true },
      { name: "Cloud Native Computing Foundation (CNCF) Courses", url: "https://training.linuxfoundation.org/resources/?_sft_free_resources=free-courses", type: "course", free: true },
    ],
    relatedJobTitles: ["Cloud Architect", "Cloud Engineer", "Solutions Architect", "Cloud Consultant"],
    avgSalaryRange: "$125,000 - $210,000",
  },
  "cybersecurity": {
    topic: "Cybersecurity & Zero Trust",
    demandLevel: "critical",
    category: "security",
    description: "With cyber threats escalating globally, cybersecurity professionals are in critical demand. Zero trust architecture is now the industry standard.",
    whyLearn: "There are 3.5 million unfilled cybersecurity positions worldwide. Open learning is an excellent path to entry level SOC roles.",
    resources: [
      { name: "Cybersecurity for Beginners (Microsoft)", url: "https://github.com/microsoft/Security-101", type: "course", free: true },
      { name: "OWASP Top 10", url: "https://owasp.org/www-project-top-ten/", type: "docs", free: true },
      { name: "TryHackMe Free Tier", url: "https://tryhackme.com/", type: "tutorial", free: true },
      { name: "Stanford Advanced Cybersecurity", url: "https://online.stanford.edu/courses/soe-ycs0001-advanced-cybersecurity-program", type: "course", free: true },
    ],
    relatedJobTitles: ["Security Engineer", "SOC Analyst", "Penetration Tester", "CISO"],
    avgSalaryRange: "$110,000 - $200,000",
  },
  "terraform": {
    topic: "Infrastructure as Code (Terraform & Ansible)",
    demandLevel: "very-high",
    category: "devops",
    description: "IaC tools like Terraform and Ansible are essential for modern cloud infrastructure management. GitOps practices drive demand further.",
    whyLearn: "Infrastructure as Code is now a required skill for almost every DevOps and cloud engineering role.",
    resources: [
      { name: "HashiCorp Learn: Terraform", url: "https://developer.hashicorp.com/terraform/tutorials", type: "tutorial", free: true },
      { name: "FreeCodeCamp Terraform Course", url: "https://www.youtube.com/watch?v=7xngnjfIlK4", type: "course", free: true },
      { name: "Ansible Getting Started", url: "https://docs.ansible.com/ansible/latest/getting_started/", type: "docs", free: true },
      { name: "Automate Infrastructure with Terraform", url: "https://learn.microsoft.com/en-us/training/paths/bicep-terraform/", type: "course", free: true },
    ],
    relatedJobTitles: ["DevOps Engineer", "Infrastructure Engineer", "Platform Engineer", "SRE"],
    avgSalaryRange: "$115,000 - $180,000",
  },
  "python": {
    topic: "Python Programming",
    demandLevel: "very-high",
    category: "technology",
    description: "Python remains the most versatile language in tech — from AI/ML and data science to automation and backend development.",
    whyLearn: "Python is the #1 language for AI, data science, and automation. It's the most requested language in job postings worldwide.",
    resources: [
      { name: "Python Official Tutorial", url: "https://docs.python.org/3/tutorial/", type: "tutorial", free: true },
      { name: "Automate the Boring Stuff", url: "https://automatetheboringstuff.com/", type: "course", free: true },
      { name: "Harvard CS50P (Intro to Python)", url: "https://cs50.harvard.edu/python/", type: "course", free: true },
      { name: "FreeCodeCamp Python for Beginners", url: "https://www.freecodecamp.org/learn/scientific-computing-with-python/", type: "course", free: true },
    ],
    relatedJobTitles: ["Software Engineer", "Data Engineer", "Backend Developer", "ML Engineer"],
    avgSalaryRange: "$100,000 - $170,000",
  },
  "rust": {
    topic: "Rust Systems Programming",
    demandLevel: "high",
    category: "technology",
    description: "Rust is the most loved programming language and is being adopted by major companies for performance-critical systems.",
    whyLearn: "Companies like Microsoft, Google, and AWS are investing heavily in Rust.",
    resources: [
      { name: "The Rust Programming Language Book", url: "https://doc.rust-lang.org/book/", type: "docs", free: true },
      { name: "Rustlings Exercises", url: "https://github.com/rust-lang/rustlings", type: "tutorial", free: true },
      { name: "Rust by Example", url: "https://doc.rust-lang.org/rust-by-example/", type: "tutorial", free: true },
      { name: "Microsoft Build Logic with Rust", url: "https://learn.microsoft.com/en-us/training/paths/rust-first-steps/", type: "course", free: true },
    ],
    relatedJobTitles: ["Systems Engineer", "Platform Engineer", "Backend Developer", "Blockchain Developer"],
    avgSalaryRange: "$130,000 - $200,000",
  },
  "typescript": {
    topic: "TypeScript & Modern Web Development",
    demandLevel: "very-high",
    category: "technology",
    description: "TypeScript has become the industry standard for web development. Full-stack TypeScript skills (React, Next.js, Node.js) are highly sought after.",
    whyLearn: "TypeScript is used by 78% of professional JavaScript developers.",
    resources: [
      { name: "TypeScript Official Handbook", url: "https://www.typescriptlang.org/docs/handbook/", type: "docs", free: true },
      { name: "Matt Pocock's TS Crash Course", url: "https://www.youtube.com/watch?v=30LWjhZzg50", type: "course", free: true },
      { name: "Next.js Learn", url: "https://nextjs.org/learn", type: "tutorial", free: true },
      { name: "Full Stack Open (Helsinki)", url: "https://fullstackopen.com/", type: "course", free: true },
    ],
    relatedJobTitles: ["Frontend Engineer", "Full Stack Developer", "Web Developer", "UI Engineer"],
    avgSalaryRange: "$95,000 - $165,000",
  },
  "serverless": {
    topic: "Serverless & Event-Driven Architecture",
    demandLevel: "high",
    category: "cloud",
    description: "Serverless computing reduces operational overhead and enables rapid scaling. AWS Lambda, Azure Functions, and GCP Cloud Functions are key skills.",
    whyLearn: "Serverless adoption has grown 40% YoY. Organizations value engineers who can build cost-efficient, auto-scaling architectures.",
    resources: [
      { name: "Serverless Framework Docs", url: "https://www.serverless.com/framework/docs", type: "docs", free: true },
      { name: "AWS Lambda Developer Guide", url: "https://docs.aws.amazon.com/lambda/latest/dg/welcome.html", type: "docs", free: true },
      { name: "Serverless Stack (SST) Tutorial", url: "https://sst.dev/", type: "tutorial", free: true },
      { name: "AWS Serverless Learning Plan", url: "https://explore.skillbuilder.aws/learn/public/learning_plan/view/1046/serverless-learning-plan", type: "course", free: true },
    ],
    relatedJobTitles: ["Cloud Developer", "Backend Engineer", "Solutions Architect", "DevOps Engineer"],
    avgSalaryRange: "$110,000 - $180,000",
  },
  "data engineering": {
    topic: "Data Engineering & Analytics",
    demandLevel: "critical",
    category: "data",
    description: "Data engineering skills are in critical demand as organizations drown in data. Mastering tools like Spark, Kafka, Snowflake, and Power BI opens doors to high-paying careers.",
    whyLearn: "Data engineer roles have grown 300% since 2020. Organizations need professionals who can build and manage data pipelines, lakes, and warehouses at scale.",
    resources: [
      { name: "Data Engineering Zoomcamp", url: "https://github.com/DataTalksClub/data-engineering-zoomcamp", type: "course", free: true },
      { name: "Apache Spark Documentation", url: "https://spark.apache.org/docs/latest/", type: "docs", free: true },
      { name: "Snowflake University", url: "https://learn.snowflake.com/", type: "course", free: true },
      { name: "Microsoft Power BI Learning Path", url: "https://learn.microsoft.com/en-us/training/powerplatform/power-bi", type: "tutorial", free: true },
      { name: "Databricks Academy (Free Tier)", url: "https://www.databricks.com/learn/training/login", type: "course", free: true },
    ],
    relatedJobTitles: ["Data Engineer", "Data Analyst", "BI Developer", "Analytics Engineer", "Data Architect"],
    avgSalaryRange: "$110,000 - $190,000",
  },
  "devops": {
    topic: "DevOps & CI/CD Pipelines",
    demandLevel: "very-high",
    category: "devops",
    description: "DevOps practices and CI/CD automation are foundational to modern software delivery. Skills in GitHub Actions, Jenkins, and GitOps are critical.",
    whyLearn: "DevOps engineers are among the highest-paid IT roles. Automation of delivery pipelines is now a baseline expectation.",
    resources: [
      { name: "GitHub Actions Documentation", url: "https://docs.github.com/en/actions", type: "docs", free: true },
      { name: "GitLab CI/CD Tutorial", url: "https://docs.gitlab.com/ee/ci/quick_start/", type: "tutorial", free: true },
      { name: "Linux Foundation DevOps Intro", url: "https://training.linuxfoundation.org/training/introduction-to-devops-and-site-reliability-engineering-lfs162/", type: "course", free: true },
      { name: "FreeCodeCamp DevOps Bootcamp", url: "https://www.youtube.com/watch?v=j5Zsa_eOXeY", type: "course", free: true },
    ],
    relatedJobTitles: ["DevOps Engineer", "SRE", "Release Engineer", "Platform Engineer"],
    avgSalaryRange: "$115,000 - $185,000",
  },
};

export async function getRecommendations(limit: number): Promise<Recommendation[]> {
  // Get current trending topics
  const trending = await getTrending(15);

  const recommendations: Recommendation[] = [];
  const addedTopics = new Set<string>();

  // Match trending topics to learning resources
  for (const trend of trending) {
    const keyword = trend.keyword.toLowerCase();

    for (const [resourceKey, resource] of Object.entries(LEARNING_RESOURCES)) {
      if (addedTopics.has(resourceKey)) continue;

      if (keyword.includes(resourceKey) || resourceKey.includes(keyword)) {
        recommendations.push({
          ...resource,
          articleCount: trend.count,
        });
        addedTopics.add(resourceKey);
        break;
      }
    }

    if (recommendations.length >= limit) break;
  }

  // Fill remaining slots with highest-demand resources not yet added
  if (recommendations.length < limit) {
    const priorityOrder = [
      "artificial intelligence",
      "cloud native",
      "cybersecurity",
      "kubernetes",
      "python",
      "typescript",
      "terraform",
      "devops",
      "rust",
      "serverless",
    ];

    for (const key of priorityOrder) {
      if (recommendations.length >= limit) break;
      if (addedTopics.has(key)) continue;

      const resource = LEARNING_RESOURCES[key];
      if (resource) {
        recommendations.push({
          ...resource,
          articleCount: 0,
        });
        addedTopics.add(key);
      }
    }
  }

  return recommendations.slice(0, limit);
}
