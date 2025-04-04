import { useState } from 'react';
import  Card  from '../../components/ui/Card';
import { Plus, Calendar, Users, Clock, MoreVertical } from 'lucide-react';

const Projects = () => {
    const [projects] = useState([
        {
            id: 1,
            name: 'Website Redesign',
            description: 'Complete overhaul of company website',
            status: 'In Progress',
            deadline: '2024-04-30',
            team: ['John Doe', 'Jane Smith'],
            progress: 65,
            priority: 'High'
        },
        {
            id: 2,
            name: 'Mobile App Development',
            description: 'New mobile app for customers',
            status: 'Planning',
            deadline: '2024-05-15',
            team: ['Mike Johnson', 'Sarah Wilson'],
            progress: 25,
            priority: 'Medium'
        },
        {
            id: 3,
            name: 'CRM Integration',
            description: 'Integrate new CRM system',
            status: 'Completed',
            deadline: '2024-03-30',
            team: ['Alex Brown', 'Emily Davis'],
            progress: 100,
            priority: 'High'
        }
    ]);

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Projects</h1>
                <button className="bg-green-500 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                    <Plus size={20} />
                    New Project
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((project) => (
                    <Card key={project.id} className="p-6">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-lg font-semibold">{project.name}</h3>
                                <p className="text-sm text-gray-500">{project.description}</p>
                            </div>
                            <button className="text-gray-400 hover:text-gray-600">
                                <MoreVertical size={20} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className={`px-2 py-1 text-xs rounded-full ${
                                    project.status === 'Completed' ? 'bg-green-100 text-green-800' :
                                    project.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                                    'bg-yellow-100 text-yellow-800'
                                }`}>
                                    {project.status}
                                </span>
                                <span className={`px-2 py-1 text-xs rounded-full ${
                                    project.priority === 'High' ? 'bg-red-100 text-red-800' :
                                    'bg-orange-100 text-orange-800'
                                }`}>
                                    {project.priority}
                                </span>
                            </div>

                            <div className="flex items-center text-sm text-gray-600">
                                <Calendar size={16} className="mr-2" />
                                Deadline: {new Date(project.deadline).toLocaleDateString()}
                            </div>

                            <div className="flex items-center text-sm text-gray-600">
                                <Users size={16} className="mr-2" />
                                Team: {project.team.join(', ')}
                            </div>

                            <div>
                                <div className="flex justify-between text-sm text-gray-600 mb-1">
                                    <span>Progress</span>
                                    <span>{project.progress}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div 
                                        className="bg-green-500 h-2 rounded-full" 
                                        style={{ width: `${project.progress}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default Projects; 