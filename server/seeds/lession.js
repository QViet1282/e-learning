/* eslint-disable camelcase */
const { fakerEN: faker } = require('@faker-js/faker')
const CategoryLession = require('../models/category_lession')
const Lession = require('../models/lession')
const User = require('../models/user')

const generateUserId = async () => {
  const roles = await User.findAll()
  const userIds = roles.map(role => role.id)
  const randomIndex = Math.floor(Math.random() * userIds.length)
  const randomUserId = userIds[randomIndex]
  return randomUserId
}
const titleExamples = [
  'Introduction to Programming Basics',
  'Understanding Web Development Fundamentals',
  'Exploring Data Science Essentials',
  'Mastering Machine Learning Techniques',
  'Essential Concepts of JavaScript Programming',
  'Python Programming Crash Course',
  'Principles of UX/UI Design',
  'Foundations of Digital Marketing Strategies',
  'Project Management Basics and Best Practices',
  'Fundamentals of Cybersecurity',
  'Advanced Algorithms and Data Structures',
  'Deep Learning Fundamentals',
  'Mobile App Development Essentials',
  'Advanced JavaScript Techniques',
  'Data Analysis with Python',
  'Creative Design Thinking Workshop',
  'Social Media Marketing Strategies',
  'Advanced Project Management Techniques',
  'Advanced Cybersecurity Practices',
  'Introduction to Artificial Intelligence',
  'Game Development Fundamentals',
  'IoT (Internet of Things) Protocols and Security',
  'Blockchain Technology and Cryptocurrency',
  'Quantum Computing Principles',
  'AR (Augmented Reality) and VR (Virtual Reality) Development',
  'Cloud Computing Infrastructure and Services',
  'Big Data Analytics and Visualization',
  'Natural Language Processing Fundamentals',
  'UI/UX Design for Mobile Applications',
  'E-commerce Strategies and Optimization',
  'Agile Software Development Methodologies',
  'Ethical Hacking Techniques',
  'Machine Learning in Finance',
  'Digital Content Creation and Marketing',
  'Supply Chain Management in the Digital Age',
  'Human-Computer Interaction Design',
  'Business Intelligence and Data Warehousing',
  'Full-Stack Web Development Bootcamp',
  'DevOps Practices and Tools',
  'Cryptography and Network Security',
  'AI Ethics and Bias Mitigation',
  'Digital Transformation Strategies',
  'Robotics and Automation Fundamentals',
  'Cloud-native Application Development',
  'Data Mining and Knowledge Discovery',
  'User-Centered Design Principles',
  'Information Retrieval Techniques',
  'Software Testing and Quality Assurance',
  'Neural Networks and Deep Learning',
  'Internet Security and Privacy',
  'Computer Vision Fundamentals',
  'Web Design Principles and Best Practices',
  'Quantitative Trading Strategies',
  'Voice User Interface (VUI) Design',
  'Social Network Analysis',
  'IoT Application Development',
  'Data Governance and Compliance',
  'IT Service Management Foundations',
  'Game Design and Development',
  'Bioinformatics and Computational Biology',
  'Cloud Security and Risk Management',
  'Digital Forensics and Incident Response',
  'UI/UX Design for Web Applications',
  'Software Architecture and Design Patterns',
  'Information Security Management',
  'Natural Language Generation',
  'Human-Robot Interaction Design',
  'Edge Computing Fundamentals',
  'Database Management and SQL',
  'Digital Accessibility Standards',
  'Geographic Information Systems (GIS)',
  'Continuous Integration and Continuous Deployment (CI/CD)',
  'Data Privacy and GDPR Compliance',
  'Front-End Web Development Frameworks',
  'Introduction to Quantum Mechanics',
  'Mobile Game Development',
  'Wireless Communication Technologies',
  'Behavior-Driven Development (BDD)',
  'Health Informatics and Electronic Health Records',
  'Cloud-native Database Solutions',
  'Cross-platform Mobile App Development',
  'Sustainable Energy Systems',
  'Behavioral Analytics and User Engagement',
  'Microservices Architecture and Design',
  'Virtualization Technologies',
  'Digital Signal Processing Fundamentals',
  'IT Risk Management and Compliance',
  'Voice Recognition and Speech Synthesis',
  '3D Modeling and Animation',
  'Containerization with Docker and Kubernetes',
  'Computational Neuroscience',
  'Web Scraping and Data Extraction',
  'Quantitative Risk Analysis',
  'Embedded Systems Programming',
  'Strategic IT Planning and Management',
  'Internet of Medical Things (IoMT)',
  'Augmented Reality Development for Education',
  'Cloud-native Application Security',
  'Blockchain Implementation Strategies',
  'Secure Software Development Practices',
  'Quantum Cryptography',
  'Human-Centered AI Design',
  'Digital Product Management',
  'Behavioral Economics and Decision Making',
  'Fintech Innovations and Disruptions',
  'Robotic Process Automation (RPA)',
  'Cyber-Physical Systems Design',
  'Dark Web Investigations and Analysis',
  'Game Engine Development',
  'Wireless Sensor Networks',
  'API Design and Development',
  'Computer Graphics Rendering Techniques',
  'Natural Language Understanding',
  'Network Protocols and Packet Analysis',
  'Web Accessibility Guidelines',
  'Automotive Cybersecurity',
  'Biomedical Image Processing',
  'Information Systems Audit and Assurance',
  'Cognitive Computing Fundamentals',
  'Machine Learning Operations (MLOps)',
  'Voice Search Optimization',
  'Digital Twin Technology',
  'Explainable AI (XAI)',
  'Deep Reinforcement Learning',
  'Social Robotics and Humanoid Design',
  'Cybersecurity Risk Assessment',
  'Smart Grid Technologies',
  'Cloud-native Monitoring and Logging',
  'Software Product Management',
  'Genomic Data Analysis',
  'Quantum Machine Learning',
  'Virtual Reality Applications in Healthcare',
  'Edge AI Applications',
  'IT Governance Frameworks',
  'Real-Time Operating Systems',
  'Mobile Robotics and Autonomous Navigation',
  'Voice Biometrics',
  'Digital Currency Regulation and Compliance',
  'Human-Machine Teaming',
  'Conversational AI Platforms',
  'IT Infrastructure Design and Optimization',
  'Geospatial Analysis and Mapping',
  'Continuous Security Testing',
  'AI in Drug Discovery and Development',
  'Cybersecurity Incident Response Planning',
  'Hybrid Cloud Management',
  'IoT Data Analytics',
  'Graph Theory and Network Analysis',
  'Voice Assistant Development',
  'Digital Workplace Technologies',
  'Computational Photography',
  'Artificial General Intelligence (AGI)',
  'Blockchain Applications in Supply Chain Management',
  'Secure Mobile App Development',
  'Quantum Internet',
  'Human-Computer Interaction in Virtual Environments',
  'Digital Marketing Analytics',
  'Smart City Technologies',
  'Cryptocurrency Trading Strategies',
  'Intelligent Tutoring Systems',
  'Ethical AI Design and Governance',
  'Big Data Ethics and Privacy',
  'Cloud Security Architecture',
  'Industrial IoT (IIoT) Systems',
  'Autonomous Vehicle Technologies',
  'Behavioral Biometrics',
  'Digital Rights Management',
  'Computer-Aided Design (CAD)',
  'Cybersecurity Awareness Training',
  'AI for Social Good',
  'Edge Computing Security',
  'Quantum Key Distribution',
  'Neuro-Linguistic Programming (NLP)',
  'Voice-Activated Home Automation',
  'Digital Transformation in Healthcare',
  'Augmented Reality Marketing',
  'Cloud-Native Application Performance Monitoring',
  'AI in Retail Industry',
  'Federated Learning',
  'Emerging Trends in Cybersecurity',
  'Voice User Authentication',
  'Digital Inclusion Strategies',
  'Human Augmentation Technologies',
  'Ethical Hacking for Beginners',
  'Blockchain and Decentralized Finance (DeFi)',
  'Machine Learning Interpretability',
  'Data Monetization Strategies',
  'AI in Agriculture',
  'Digital Risk Management',
  'AI-powered Chatbots',
  'Cloud-Native Storage Solutions'
]

const descriptionExamples = [
  'A comprehensive introduction to programming concepts and techniques using popular programming languages.',
  'Learn the foundational principles and technologies behind web development, including HTML, CSS, and JavaScript.',
  'Explore the essential concepts and techniques in data science, including data analysis and visualization.',
  'Master advanced machine learning algorithms and techniques for solving real-world problems.',
  'Dive deep into the core concepts and advanced features of JavaScript programming language.',
  'A quick-paced course covering the fundamentals of Python programming for beginners.',
  'Learn the principles and best practices of user experience (UX) and user interface (UI) design.',
  'Foundations of digital marketing strategies covering SEO, SEM, social media, and more.',
  'Understand the basics of project management and learn best practices for successful project execution.',
  'Explore the fundamentals of cybersecurity, including network security and threat detection.',
  'Advanced algorithms and data structures for solving complex computational problems efficiently.',
  'Deep dive into the principles and applications of deep learning neural networks.',
  'Essential skills and techniques for developing mobile applications for iOS and Android platforms.',
  'Advanced JavaScript techniques for building interactive and dynamic web applications.',
  'Learn data analysis techniques using Python libraries like Pandas and NumPy.',
  'A workshop to foster creative thinking and problem-solving skills in design.',
  'Strategies for leveraging social media platforms to reach and engage target audiences.',
  'Advanced techniques for managing and leading successful projects.',
  'Advanced cybersecurity practices for protecting against advanced threats and attacks.',
  'An overview of artificial intelligence and its applications in various industries.',
  'Foundational principles and techniques for designing and developing video games.',
  'Learn about IoT protocols and security measures for connected devices.',
  'Explore the fundamentals of blockchain technology and cryptocurrencies like Bitcoin.',
  'An introduction to the principles and applications of quantum computing.',
  'Learn to develop augmented reality (AR) and virtual reality (VR) applications.',
  'Understanding cloud computing infrastructure and services like AWS and Azure.',
  'Analyze and visualize large datasets to extract meaningful insights.',
  'Fundamental concepts and techniques in natural language processing (NLP).',
  'Design principles and best practices for creating engaging mobile user interfaces.',
  'Strategies and optimization techniques for e-commerce websites and online stores.',
  'Learn agile methodologies and practices for software development and project management.',
  'Ethical hacking techniques and strategies for identifying and mitigating security vulnerabilities.',
  'Applications of machine learning algorithms in financial markets and investment strategies.',
  'Creating and marketing digital content across various platforms and channels.',
  'Explore the role of supply chain management in the digital era.',
  'Designing human-computer interfaces for intuitive and efficient interaction.',
  'Techniques for analyzing and visualizing business data for decision-making.',
  'A comprehensive bootcamp covering front-end and back-end web development technologies.',
  'Learn about DevOps practices and tools for continuous integration and delivery.',
  'Understanding cryptography principles and implementing secure communication.',
  'Ethical considerations and mitigation strategies in AI development and deployment.',
  'Strategies and approaches for digitally transforming businesses and organizations.',
  'Principles and applications of robotics and automation in various industries.',
  'Developing and securing cloud-native applications using modern technologies.',
  'Exploring techniques for discovering patterns and knowledge from large datasets.',
  'Designing user-centered interfaces and experiences for digital products.',
  'Techniques for retrieving and presenting information from large datasets.',
  'Ensure the quality and reliability of software products through testing and QA processes.',
  'Understanding neural networks and their applications in deep learning algorithms.',
  'Securing internet communications and protecting online privacy.',
  'Principles and techniques for processing and analyzing visual data.',
  'Design principles and best practices for creating user-friendly websites.',
  'Strategies for developing algorithmic trading models and systems.',
  'Designing voice user interfaces (VUIs) for seamless human-computer interaction.',
  'Analyzing social network data to understand relationships and behavior patterns.',
  'Developing applications for the Internet of Things (IoT) ecosystem.',
  'Understanding data governance frameworks and ensuring regulatory compliance.',
  'Best practices for managing IT services and optimizing IT infrastructure.',
  'Principles and techniques for designing and developing video games.',
  'Using computational techniques to analyze biological data and solve biological problems.',
  'Securing cloud environments and managing risks associated with cloud adoption.',
  'Investigating digital crimes and responding to security incidents effectively.',
  'Designing user interfaces and experiences for web applications.',
  'Architectural patterns and design principles for building scalable software systems.',
  'Managing information security risks and ensuring compliance with regulations.',
  'Generating human-like text and narratives using AI algorithms.',
  'Designing interactions between humans and robots for optimal collaboration.',
  'Fundamental principles and applications of edge computing technologies.',
  'Managing and optimizing databases using SQL and other technologies.',
  'Designing digital products and services accessible to all users.',
  'Analyzing geographic data and creating maps for various applications.',
  'Implementing continuous integration and deployment pipelines for software development.',
  'Ensuring compliance with data privacy regulations like GDPR.',
  'Exploring front-end development frameworks like React and Angular.',
  'Understanding the principles of quantum mechanics and their applications.',
  'Developing games for mobile platforms like iOS and Android.',
  'Exploring wireless communication protocols and technologies.',
  'Developing software using behavior-driven development methodologies.',
  'Understanding healthcare informatics and electronic health record systems.',
  'Managing and securing databases in cloud-native environments.',
  'Developing cross-platform mobile applications for iOS and Android.',
  'Exploring sustainable energy sources and systems for a greener future.',
  'Analyzing user behavior and designing strategies to increase engagement.',
  'Architectural patterns and design principles for microservices-based systems.',
  'Virtualization technologies and their applications in cloud computing.',
  'Fundamental principles and techniques of digital signal processing.',
  'Managing IT risks and ensuring compliance with regulations and standards.',
  'Developing and deploying voice recognition and synthesis systems.',
  'Creating 3D models and animations for various applications.',
  'Containerization techniques using Docker and Kubernetes for application deployment.',
  'Understanding the computational principles of neuroscience.',
  'Extracting data from websites and online sources for analysis and use.',
  'Quantifying and managing risks associated with business decisions and operations.',
  'Programming embedded systems for various applications and industries.',
  'Planning and managing IT strategies for business growth and innovation.',
  'Developing applications for the Internet of Medical Things (IoMT).',
  'Creating augmented reality applications for educational purposes.',
  'Securing cloud-native applications against emerging threats and vulnerabilities.',
  'Strategies for implementing blockchain technology in business processes.',
  'Developing secure software applications using best practices and methodologies.',
  'Securing communications using quantum cryptographic techniques.',
  'Designing AI systems that are transparent, fair, and accountable.',
  'Managing and overseeing the development of digital products and services.',
  'Applying principles of behavioral economics to decision-making processes.',
  'Understanding innovations and disruptions in the financial technology sector.',
  'Automating repetitive tasks and processes using software robots.',
  'Designing cyber-physical systems for optimal performance and security.',
  'Conducting investigations and analysis on the dark web for security purposes.',
  'Developing game engines for creating interactive and immersive experiences.',
  'Designing and deploying wireless sensor networks for monitoring and control applications.',
  'Creating APIs for enabling communication between software applications.',
  'Implementing rendering techniques for generating computer graphics.',
  'Understanding natural language and processing text data for various applications.',
  'Analyzing network protocols and packets for troubleshooting and security purposes.',
  'Ensuring web accessibility and compliance with accessibility guidelines.',
  'Securing automotive systems and protecting connected vehicles against cyber threats.',
  'Processing and analyzing images from biomedical imaging devices.',
  'Auditing information systems to ensure compliance with security standards.',
  'Understanding the computational principles behind cognitive computing systems.',
  'Implementing machine learning operations (MLOps) for deploying and managing ML models.',
  'Optimizing websites and content for voice search queries and interactions.',
  'Creating digital twins for simulating and optimizing real-world systems.',
  'Ensuring transparency and interpretability in AI systems and algorithms.',
  'Exploring reinforcement learning algorithms for training intelligent agents.',
  'Designing social robots with natural interaction capabilities.',
  'Assessing and managing cybersecurity risks within organizations.',
  'Implementing smart grid technologies for efficient energy distribution and management.',
  'Monitoring and logging cloud-native applications for performance and security.',
  'Managing software products throughout their lifecycle, from conception to retirement.',
  'Analyzing genomic data for insights into genetic variations and diseases.',
  'Applying machine learning techniques in quantum computing applications.',
  'Developing virtual reality applications for medical training and therapy.',
  'Implementing artificial intelligence at the edge for real-time processing.',
  'Developing governance frameworks for managing IT resources and operations.',
  'Understanding real-time operating systems and their applications.',
  'Designing and programming autonomous navigation systems for robots and vehicles.',
  'Implementing voice biometrics for secure authentication and identification.',
  'Ensuring compliance with regulations and standards for digital currencies.',
  'Collaborating between humans and machines for enhanced productivity and efficiency.',
  'Building conversational AI platforms for natural language interactions.',
  'Designing and optimizing IT infrastructure for performance and scalability.',
  'Analyzing geographic data for urban planning and environmental management.',
  'Integrating security testing into the software development lifecycle.',
  'Applying AI techniques in drug discovery and pharmaceutical research.',
  'Planning and preparing for cybersecurity incidents and breaches.',
  'Managing hybrid cloud environments for flexibility and efficiency.',
  'Analyzing data from IoT devices to extract valuable insights.',
  'Applying graph theory and network analysis for understanding complex systems.',
  'Developing voice assistant applications for various devices and platforms.',
  'Integrating technology to enhance productivity and collaboration in the workplace.',
  'Applying computational techniques to enhance photography capabilities.',
  'Exploring the concept of artificial general intelligence and its implications.',
  'Implementing blockchain solutions for tracking and tracing supply chain activities.',
  'Developing secure mobile applications using encryption and authentication techniques.',
  'Exploring the possibilities of a quantum internet for secure communication.',
  'Designing human-computer interactions for virtual reality environments.',
  'Applying digital marketing analytics for data-driven decision-making.',
  'Implementing technologies to create smarter and more sustainable cities.',
  'Developing trading strategies for buying and selling cryptocurrencies.',
  'Building intelligent tutoring systems for personalized learning experiences.',
  'Ensuring ethical considerations are addressed in AI development and deployment.',
  'Addressing ethical and privacy concerns in big data analytics.',
  'Designing secure architectures for cloud-based applications and services.',
  'Implementing IIoT systems for optimizing industrial processes and operations.',
  'Developing technologies for autonomous vehicles and self-driving cars.',
  'Utilizing behavioral biometrics for user authentication and identification.',
  'Managing digital rights and protecting intellectual property online.',
  'Using CAD software for designing and modeling physical objects and systems.',
  'Training employees and individuals on cybersecurity best practices.',
  'Applying AI for social good, such as healthcare, education, and sustainability.',
  'Securing edge computing environments against cyber threats and vulnerabilities.',
  'Implementing quantum key distribution for secure communication channels.',
  'Applying principles of NLP for understanding and processing human language.',
  'Creating voice-activated systems for home automation and control.',
  'Leveraging digital transformation to improve healthcare delivery and outcomes.',
  'Using augmented reality for marketing and advertising campaigns.',
  'Monitoring and optimizing performance of cloud-native applications.',
  'Applying AI techniques in retail for personalized customer experiences.',
  'Implementing federated learning for collaborative machine learning models.',
  'Staying informed about emerging trends and developments in cybersecurity.',
  'Developing voice authentication systems for secure user access.',
  'Promoting digital inclusion and accessibility for all individuals.',
  'Exploring technologies for enhancing human capabilities and functions.',
  'Learning the basics of ethical hacking for identifying security vulnerabilities.',
  'Understanding the intersection of blockchain technology and decentralized finance.',
  'Interpreting machine learning models for better understanding and decision-making.',
  'Exploring strategies for monetizing data assets and maximizing value.',
  'Applying AI techniques in agriculture for crop monitoring and optimization.',
  'Managing digital risks associated with technological advancements and innovations.',
  'Developing AI-powered chatbots for automated customer support and assistance.',
  'Implementing storage solutions optimized for cloud-native environments.'
]
const type = ['PDF', 'DOC', 'MP4', 'MP4', 'MP4', 'MP4', 'MP4']
const content = ['Content1', 'Content2', 'Content3']
const sampleVideoLocationPaths = [
  'Da1tpV9TMU0',
  '9_uoKY0AwqE',
  'vFhKEYRBmVY',
  'Z5O6pxQm6II',
  'qpIautEyv2s',
  '79mzaFPLEz8',
  'zccrOA-00lM',
  'THAJMtm53ZQ',
  'RX8tkygyHPU',
  'MTbZLshZg0U'
]
const samplePDFLocationPaths = [
  'pdf1.pdf',
  'pdf2.pdf',
  'pdf3.pdf'
]
// khong trung lien tuc
const generateLessions = async () => {
  const lessions = []
  const category_lessions = await CategoryLession.findAll()
  let currentCategoryId = null
  let order = 1
  let videoIndex = 0
  const status = 1
  for (let i = 0; i < category_lessions.length; i++) {
    const category_lession = category_lessions[i]
    const lessionCategoryId = category_lession.id
    if (lessionCategoryId !== currentCategoryId) {
      order = 1
      currentCategoryId = lessionCategoryId
    }

    const randomContent = content[Math.floor(Math.random() * content.length)]
    let sampleNamesCopy = [...titleExamples]
    let sampleDescriptionCopy = [...descriptionExamples]
    const usedNames = new Set()
    const numLessons = Math.floor(Math.random() * 3) + 1
    for (let j = 0; j < numLessons; j++) {
      const randomType = type[Math.floor(Math.random() * type.length)]
      let randomLocationPath

      switch (randomType) {
        case 'MP4':
          randomLocationPath = sampleVideoLocationPaths[videoIndex % sampleVideoLocationPaths.length]
          videoIndex++
          break
        case 'PDF':
          randomLocationPath = samplePDFLocationPaths[Math.floor(Math.random() * samplePDFLocationPaths.length)]
          break
        case 'DOC':
          randomLocationPath = samplePDFLocationPaths[Math.floor(Math.random() * samplePDFLocationPaths.length)]
          break
        default:
          randomLocationPath = 'defaultPath'
      }

      let randomIndex
      let categoryLessonName
      do {
        randomIndex = Math.floor(Math.random() * sampleNamesCopy.length)
        categoryLessonName = sampleNamesCopy[randomIndex]
      } while (usedNames.has(categoryLessonName))

      const description = sampleDescriptionCopy[randomIndex]
      usedNames.add(categoryLessonName)
      sampleNamesCopy = sampleNamesCopy.filter((_, index) => index !== randomIndex)
      sampleDescriptionCopy = sampleDescriptionCopy.filter((_, index) => index !== randomIndex)

      lessions.push({
        lessionCategoryId,
        name: categoryLessonName,
        description,
        type: randomType,
        content: randomContent,
        order,
        locationPath: randomLocationPath,
        uploadedBy: await generateUserId(),
        status,
        createAt: faker.date.past(),
        updatedAt: faker.date.recent()
      })

      if (sampleNamesCopy.length === 0 || sampleDescriptionCopy.length === 0) {
        sampleNamesCopy = [...titleExamples]
        sampleDescriptionCopy = [...descriptionExamples]
      }
      order++
    }
  }
  return lessions
}
// const generateLessions = async () => {
//   const lessions = []
//   const category_lessions = await CategoryLession.findAll()
//   let currentCategoryId = null
//   let order = 1
//   for (let i = 0; i < category_lessions.length; i++) {
//     const category_lession = category_lessions[i]
//     const lessionCategoryId = category_lession.id

//     if (lessionCategoryId !== currentCategoryId) {
//       order = 1
//       currentCategoryId = lessionCategoryId
//     }

//     const randomContent = content[Math.floor(Math.random() * content.length)]
//     let sampleNamesCopy = [...titleExamples]
//     let sampleDescriptionCopy = [...descriptionExamples]
//     const numLessons = Math.floor(Math.random() * 3) + 1
//     for (let j = 0; j < numLessons; j++) {
//       const randomType = type[Math.floor(Math.random() * type.length)]
//       let randomLocationPath
//       switch (randomType) {
//         case 'MP4':
//           randomLocationPath = sampleVideoLocationPaths[Math.floor(Math.random() * sampleVideoLocationPaths.length)]
//           break
//         case 'PDF':
//           randomLocationPath = samplePDFLocationPaths[Math.floor(Math.random() * samplePDFLocationPaths.length)]
//           break
//         case 'DOC':
//           randomLocationPath = samplePDFLocationPaths[Math.floor(Math.random() * samplePDFLocationPaths.length)]
//           break
//         default:
//           // Handle unknown type or set a default path
//           randomLocationPath = 'defaultPath'
//       }
//       const randomIndex = Math.floor(Math.random() * sampleNamesCopy.length)
//       const categoryLessonName = sampleNamesCopy[randomIndex]
//       const description = sampleDescriptionCopy[randomIndex]
//       sampleNamesCopy = sampleNamesCopy.filter((_, index) => index !== randomIndex)
//       sampleDescriptionCopy = sampleDescriptionCopy.filter((_, index) => index !== randomIndex)
//       lessions.push({
//         lessionCategoryId,
//         name: categoryLessonName,
//         description,
//         type: randomType,
//         content: randomContent,
//         order,
//         locationPath: randomLocationPath,
//         uploadedBy: await generateUserId(),
//         createAt: faker.date.past(),
//         updatedAt: faker.date.recent()
//       })
//       if (sampleNamesCopy.length === 0 || sampleDescriptionCopy.length === 0) {
//         sampleNamesCopy = [...titleExamples]
//         sampleDescriptionCopy = [...descriptionExamples]
//       }
//       order++
//     }
//   }
//   return lessions
// }
const seedLessions = async () => {
  try {
    const count = await Lession.count()
    if (count === 0) {
      const lessions = await generateLessions()
      await Lession.bulkCreate(lessions, { validate: true })
    } else {
      console.log('Lessions table is not empty.')
    }
  } catch (error) {
    console.log(`Failed to seed Lessions data: ${error}`)
  }
}

module.exports = seedLessions
