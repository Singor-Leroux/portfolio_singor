
import { usePortfolio } from '../contexts/PortfolioContext';

const TestDataFetching = () => {
  const { 
    skills, 
    projects, 
    certifications, 
    education, 
    experience, 
    isLoading, 
    isError 
  } = usePortfolio();

  if (isLoading) {
    return <div>Chargement des données...</div>;
  }

  if (isError) {
    return <div>Erreur lors du chargement des données</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Test de récupération des données</h1>
      
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">Compétences ({skills.length})</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {skills.map((skill) => (
            <div key={skill._id} className="p-4 border rounded-lg shadow-sm">
              <h3 className="font-medium">{skill.name}</h3>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full" 
                  style={{ width: `${skill.level * 20}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600 mt-1">Niveau: {skill.level}/5</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">Projets ({projects.length})</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div key={project._id} className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              {project.imageUrl && (
                <img 
                  src={project.imageUrl} 
                  alt={project.title}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-4">
                <h3 className="font-semibold text-lg">{project.title}</h3>
                <p className="text-gray-600 mt-2">{project.description}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {project.technologies.map((tech, idx) => (
                    <span key={idx} className="text-xs bg-gray-100 px-2 py-1 rounded">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">Certifications ({certifications.length})</h2>
        <div className="space-y-4">
          {certifications.map((cert) => (
            <div key={cert._id} className="p-4 border rounded-lg">
              <h3 className="font-medium">{cert.title}</h3>
              <p className="text-gray-600">{cert.issuer} • {new Date(cert.date).toLocaleDateString()}</p>
              {cert.credentialUrl && (
                <a 
                  href={cert.credentialUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline text-sm"
                >
                  Voir la certification
                </a>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">Formation ({education.length})</h2>
        <div className="space-y-6">
          {education.map((edu) => (
            <div key={edu._id} className="border-l-4 border-blue-500 pl-4 py-1">
              <h3 className="font-medium">{edu.degree}</h3>
              <p className="text-gray-700">{edu.institution}</p>
              <p className="text-sm text-gray-500">
                {new Date(edu.startDate).toLocaleDateString()} - {edu.endDate ? new Date(edu.endDate).toLocaleDateString() : 'Présent'}
              </p>
              {edu.description && <p className="mt-2 text-gray-600">{edu.description}</p>}
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-3">Expérience professionnelle ({experience.length})</h2>
        <div className="space-y-6">
          {experience.map((exp) => (
            <div key={exp._id} className="border-l-4 border-green-500 pl-4 py-2">
              <div className="flex justify-between flex-col sm:flex-row">
                <h3 className="font-medium">{exp.position}</h3>
                <p className="text-sm text-gray-600">
                  {new Date(exp.startDate).toLocaleDateString()} - {exp.endDate ? new Date(exp.endDate).toLocaleDateString() : 'Présent'}
                </p>
              </div>
              <p className="text-gray-700">{exp.company}, {exp.location}</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                {exp.description.map((item, idx) => (
                  <li key={idx} className="text-gray-600">{item}</li>
                ))}
              </ul>
              <div className="mt-2 flex flex-wrap gap-2">
                {exp.technologies.map((tech, idx) => (
                  <span key={idx} className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default TestDataFetching;
