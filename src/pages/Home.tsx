import React from 'react';
import { Link } from 'react-router-dom';
import { projects } from '../data/projects';

const Home: React.FC = () => {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-blue-100 text-blue-800';
      case 'advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 导航栏 */}
      <nav className="bg-blue-600 text-white shadow-md">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="text-xl font-bold">Python数据分析训练平台</h1>
          <div className="flex space-x-4">
            <a href="#" className="hover:underline">关于平台</a>
            <a href="#" className="hover:underline">技术栈</a>
          </div>
        </div>
      </nav>

      {/* 英雄区 */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-700 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">AI时代的Python数据分析训练</h1>
          <p className="text-xl mb-8">
            10个递进式项目，从数据清洗到机器学习，全面掌握pandas核心能力
          </p>
          <div className="flex justify-center space-x-4">
            <Link 
              to="/project/1" 
              className="bg-white text-blue-600 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition"
            >
              开始第一个项目
            </Link>
            <a 
              href="#projects" 
              className="bg-transparent border border-white text-white px-6 py-3 rounded-lg font-medium hover:bg-white hover:bg-opacity-10 transition"
            >
              浏览所有项目
            </a>
          </div>
        </div>
      </div>

      {/* 平台介绍 */}
      <div className="container mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold mb-6 text-center">平台特色</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition">
            <h3 className="text-xl font-semibold mb-3 text-blue-600">递进式学习</h3>
            <p className="text-gray-700">
              从基础的数据清洗开始，逐步过渡到高级的聚类分析，适合不同水平的学习者
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition">
            <h3 className="text-xl font-semibold mb-3 text-blue-600">实践导向</h3>
            <p className="text-gray-700">
              每个项目都提供完整的代码示例和模拟数据，学生可以直接运行并修改代码
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition">
            <h3 className="text-xl font-semibold mb-3 text-blue-600">企业级应用</h3>
            <p className="text-gray-700">
              覆盖电商、零售等实际业务场景，所学技能可直接应用到工作中
            </p>
          </div>
        </div>
      </div>

      {/* 项目列表 */}
      <div id="projects" className="container mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold mb-8 text-center">训练项目</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Link 
              to={`/project/${project.id}`} 
              key={project.id}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition overflow-hidden group"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition">
                    项目{project.id}：{project.title}
                  </h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(project.difficulty)}`}>
                    {project.difficulty === 'beginner' ? '初级' : project.difficulty === 'intermediate' ? '中级' : '高级'}
                  </span>
                </div>
                <p className="text-gray-600 mb-4 line-clamp-2">
                  {project.description}
                </p>
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-500 mb-2">技术要点：</h4>
                  <div className="flex flex-wrap gap-2">
                    {project.technicalPoints.slice(0, 3).map((point, index) => (
                      <span key={index} className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs">
                        {point.split(' ')[0]}
                      </span>
                    ))}
                    {project.technicalPoints.length > 3 && (
                      <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs">
                        +{project.technicalPoints.length - 3}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex justify-end">
                  <span className="text-blue-600 font-medium group-hover:underline">
                    查看详情 →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* 技术栈 */}
      <div className="bg-gray-100 py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-8 text-center">技术栈</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="font-semibold mb-2">Python</h3>
              <p className="text-sm text-gray-600">数据分析核心语言</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="font-semibold mb-2">Pandas</h3>
              <p className="text-sm text-gray-600">数据处理与分析库</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="font-semibold mb-2">NumPy</h3>
              <p className="text-sm text-gray-600">科学计算库</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="font-semibold mb-2">Matplotlib</h3>
              <p className="text-sm text-gray-600">数据可视化库</p>
            </div>
          </div>
        </div>
      </div>

      {/* 页脚 */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="mb-4">Python数据分析训练平台 © 2024</p>
          <p className="text-gray-400 text-sm">
            基于AI时代背景及Python数据分析教学需求设计
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;