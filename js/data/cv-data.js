/**
 * Personal Portfolio & CV Data
 * Updated with official CV information for Christian Saeby.
 */

export const cvData = {
  personal: {
    name: "Christian Saeby",
    title: "Engineering Lead | People, Technology & Delivery",
    subtitle: "8 Years Experience | People Leadership | Technical Direction | Engineering Delivery | .NET & Azure | Stockholm",
    location: "Stockholm, Sweden",
    email: "christian.saeby@gmail.com",
    phone: "+46 76 211 70 03",
    website: "https://github.com/csaeby",
    status: "Open to Engineering Manager, Engineering Lead & Tech Lead Roles",
    avatar: "⚡",
    summary: `Hands-on engineering leader with experience in people leadership, technical direction, and delivery. Skilled at supporting engineers, setting priorities, and fostering an open and collaborative engineering environment. Strong technical background in C#, .NET, applied AI, data systems, and Microsoft Azure. Combines technical depth with pragmatic leadership.`
  },

  stations: [
    {
      id: "experience",
      number: "01",
      title: "Work Experience",
      subtitle: "People, Technology & Delivery",
      icon: "💼",
      color: 0x10b981, // Emerald Green
      accentHex: "#10b981",
      position: { x: 0, z: -10 },
      rotation: 0,
      preview: "8 years spanning people leadership, technical direction, engineering delivery, and hands-on software development.",
      content: {
        roles: [
          {
            role: "Engineering Lead",
            company: "Mavatar",
            period: "Nov 2024 – Present",
            location: "Stockholm, Sweden",
            description: "Technical lead for a cloud-based scientific data platform designed to support research and scientific discovery, combining hands-on software development with technical leadership, engineering quality, and team support.",
            highlights: [
              "Lead engineering priorities and technical direction across architecture, delivery, and operations, creating clarity around priorities, resolving dependencies, and supporting effective delivery across the team.",
              "Support employees and consultants through one-to-ones, coaching, technical guidance, and professional development.",
              "Own the design and development of a production RAG platform using C#/.NET, Azure OpenAI, PostgreSQL/pgvector, and Microsoft Azure.",
              "Drive engineering practices across architecture, CI/CD, testing, observability, security, and reliability.",
              "Conduct AI safety and risk assessments and contribute to ISO/IEC 27001 documentation and security processes."
            ],
            technologies: ["People Leadership", "Engineering Priorities", "Delivery", "Coaching", "Technical Direction", "Architecture", "C#", ".NET", "Azure OpenAI", "PostgreSQL", "pgvector", "Microsoft Azure", "CI/CD", "AI Safety", "ISO/IEC 27001"]
          },
          {
            role: "Senior Software Engineer",
            company: "Frenda",
            period: "Nov 2022 – Nov 2024",
            location: "Stockholm, Sweden",
            description: "Held a leading role in designing and delivering technical solutions, combining hands-on software development with responsibility for technical decisions and solution architecture.",
            highlights: [
              "Worked directly with customers and internal stakeholders to identify business needs and translate them into maintainable technical solutions.",
              "Took a leading role in solution design and technical decision-making, from early requirements discussions through implementation and delivery.",
              "Designed and implemented backend solutions using C#, .NET, ASP.NET Core, SQL, and Microsoft Azure, with a focus on maintainability and long-term product needs.",
              "Helped shape architecture, engineering practices, and technical approaches while supporting the continued growth of the engineering organization."
            ],
            technologies: ["Technical Leadership", "Stakeholder Alignment", "Solution Design", "Delivery", "Architecture", "C#", ".NET", "ASP.NET Core", "SQL", "Microsoft Azure"]
          },
          {
            role: "Software Engineer and Consultant",
            company: "Netlight",
            period: "Nov 2022 – Nov 2023",
            location: "Stockholm, Sweden",
            description: "Played a key role in advancing a client's product through .NET development, database architecture, and technical collaboration.",
            highlights: [
              "Improved the product and its underlying technical capabilities using C#, .NET, SQL, and database design.",
              "Worked with stakeholders to align technical initiatives with organizational goals and supported the growth of the client's technical department.",
              "Participated in technical interviews and candidate evaluation as part of the client's recruitment process."
            ],
            technologies: ["Stakeholder Alignment", "Recruitment", "Candidate Evaluation", "C#", ".NET", "SQL", "Database Architecture"]
          },
          {
            role: "Consultant",
            company: "Accenture",
            period: "Aug 2018 – Nov 2022",
            location: "Stockholm, Sweden",
            description: "Contributed to large-scale IT implementation, digitalization, and transformation initiatives across application development, cloud engineering, and quality assurance.",
            highlights: [
              "Helped transform a client's infrastructure to Microsoft Azure through architecture design and automation for cloud-service provisioning.",
              "Designed, built, and configured e-commerce capabilities using SAP Hybris, Java, Spring, Azure, REST APIs, microservices, and Azure Functions.",
              "Worked with DevOps pipelines, PowerShell automation, Cosmos DB, CI/CD, development, and quality assurance in enterprise delivery environments."
            ],
            technologies: ["Enterprise Delivery", "Cloud Transformation", "Microsoft Azure", "Azure DevOps", "Azure Functions", "Java", "Spring", "SAP Hybris", "Microservices", "PowerShell", "CI/CD"]
          },
          {
            role: "Co-Founder and Software Developer",
            company: "MageArena.io",
            period: "Jan 2021 – Jan 2022",
            location: "Stockholm, Sweden",
            description: "Co-founded a game studio and helped take a real-time multiplayer product from concept to market launch.",
            highlights: [
              "Owned technical product development across Unity, C#, gameplay, user interface, and real-time network communication using Mirror.",
              "Combined network optimization, product design, testing, branding, marketing, competitor analysis, and player research to deliver a responsive and user-focused experience."
            ],
            technologies: ["Product Ownership", "Market Launch", "User Research", "C#", "Unity", "Mirror", "Multiplayer Networking", "Product Design"]
          }
        ]
      }
    },

    {
      id: "interests",
      number: "03",
      title: "Outside of Work",
      subtitle: "Interests & Life Beyond Code",
      icon: "⛳",
      color: 0x8b5cf6, // Violet / Purple
      accentHex: "#8b5cf6",
      position: { x: 0, z: 10 },
      rotation: Math.PI,
      preview: "Golf enthusiast, reader and music addict.",
      content: {
        headline: "Beyond the Code: Sport, Mindset & Continuous Learning",
        intro: "I believe that sustained engineering excellence and effective technical leadership are fueled by curiosity, balance, and pursuits that challenge the mind and body outside the terminal.",
        sections: [
          {
            title: "Golf Enthusiast",
            badge: "Current Handicap: 13.1",
            icon: "⛳",
            highlight: "Course strategy, mental discipline & the pursuit of consistency!",
            description: "An active and dedicated golf enthusiast. To me, golf is the ultimate study in patience, deliberate practice, and strategic decision-making. Much like software architecture, success on the course requires breaking down complex challenges, managing risk, and maintaining composure under pressure.",
            details: [
              "20% slice, 20% hooks and 60% greatness",
              "Appreciates the mental reset and deep focus that 4+ hours outdoors on the course provides"
            ]
          },
          {
            title: "Reader",
            badge: "Active Book Club Count: 2",
            icon: "📚",
            highlight: "Aspiring sci-fi nerd.",
            description: "Broad spectrum of books due to book clubs",
            details: [
              "Top 3 recent books: Project hail mary, Doppler, Three body problem",
            ]
          },
          {
            title: "Music",
            badge: "Dance & vibes",
            icon: "🎧",
            highlight: "Swedish indiepop/rock and 90s guilty pleasures",
            description: "Music made me do it",
            details: [
              "A steady rotation of Jonas Lundqvist, Kent, other Swedish indie, and pop",
              "Always up for a good concert"            
            ]
          }
        ]
      }
    },

    {
      id: "skills",
      number: "02",
      title: "Skills & Background",
      subtitle: "Expertise, Education & Credentials",
      icon: "⚡",
      color: 0xf59e0b, // Amber / Orange
      accentHex: "#f59e0b",
      position: { x: 10, z: 0 },
      rotation: -Math.PI / 2,
      preview: "Technical expertise in C#, .NET, Azure and applied AI, supported by an MSc in Industrial Engineering and Management.",
      content: {
        categories: [
          {
            name: "Backend & Architecture",
            skills: [
              { name: "C# & .NET", level: 98 },
              { name: "ASP.NET Core & REST APIs", level: 96 },
              { name: "Software & Solution Architecture", level: 95 },
              { name: "Microservices & Distributed Systems", level: 92 },
              { name: "Auth & Access Management", level: 90 }
            ]
          },
          {
            name: "Cloud & DevOps",
            skills: [
              { name: "Microsoft Azure", level: 96 },
              { name: "Azure DevOps & CI/CD Pipelines", level: 94 },
              { name: "Bicep (IaC) & Docker", level: 92 },
              { name: "Azure Functions & Container Apps", level: 90 },
              { name: "Key Vault & Managed Identity", level: 94 },
              { name: "Application Insights & OpenTelemetry", level: 88 }
            ]
          },
          {
            name: "AI & Data",
            skills: [
              { name: "Azure OpenAI & RAG Systems", level: 94 },
              { name: "PostgreSQL & pgvector", level: 94 },
              { name: "Neo4j & Cypher Graph DB", level: 90 },
              { name: "Microsoft.Extensions.AI", level: 92 },
              { name: "Relational DB Design & Pipelines", level: 92 },
              { name: "Large Structured Datasets & HDF5", level: 86 }
            ]
          },
          {
            name: "Leadership & Governance",
            skills: [
              { name: "People Leadership & Development", level: 96 },
              { name: "Engineering Priorities & Delivery", level: 96 },
              { name: "Technical Direction & Decision-Making", level: 95 },
              { name: "Stakeholder Alignment & Recruitment", level: 92 },
              { name: "AI Safety & ISO/IEC 27001", level: 88 }
            ]
          }
        ],
        degrees: [
          {
            degree: "MSc in Industrial Engineering and Management",
            institution: "Linköping University (Sweden)",
            year: "2013 – 2018",
            details: "Technical specialization: Computer Science | Business specialization: Strategic Management and Control."
          },
          {
            degree: "Exchange Term (Study Abroad)",
            institution: "Queensland University of Technology, Brisbane (Australia)",
            year: "H2 2015",
            details: "Completed one academic exchange term at Queensland University of Technology in Brisbane, Australia."
          }
        ],
        certifications: [
          { name: "8 Years Professional Engineering & Tech Lead Experience", issuer: "Enterprise & Consulting", year: "2018 – Present" },
          { name: "Solution Architecture & Cloud Transformation", issuer: "Accenture & Netlight", year: "Enterprise" },
          { name: "Applied AI, Vector Search & Graph Data Systems", issuer: "Mavatar Platform Lead", year: "Recent" }
        ],
        languages: [
          { language: "Swedish", proficiency: "Native / Bilingual" },
          { language: "English", proficiency: "Fluent / Professional Working" }
        ]
      }
    },

    {
      id: "contact",
      number: "04",
      title: "Contact & Connect",
      subtitle: "Let's Build Together",
      icon: "📫",
      color: 0xf43f5e, // Rose / Pink
      accentHex: "#f43f5e",
      position: { x: -10, z: 0 },
      rotation: Math.PI / 2,
      preview: "Direct channels to get in touch with Christian Saeby: email, phone, LinkedIn, and location.",
      content: {
        callToAction: "I'm always interested in discussing technical leadership, cloud architecture, and high-impact engineering opportunities. Let's connect!",
        links: [
          { name: "Email", value: "christian.saeby@gmail.com", href: "mailto:christian.saeby@gmail.com", icon: "📧" },
          { name: "Phone", value: "+46 76 211 70 03", href: "tel:+46762117003", icon: "📱" },
          { name: "Location", value: "Stockholm, Sweden", href: null, icon: "📍" },
          { name: "LinkedIn", value: "linkedin.com/in/christian-saeby-914b97132", href: "https://www.linkedin.com/in/christian-saeby-914b97132/", icon: "💼" },
          { name: "GitHub", value: "github.com/csaeby", href: "https://github.com/csaeby", icon: "🐙" }
        ],
        availability: "Engineering Lead • Open to engineering leadership and management opportunities in Stockholm."
      }
    }
  ]
};

// Station numbers define the recruiter-focused journey through the gallery.
cvData.stations.sort((a, b) => Number(a.number) - Number(b.number));
