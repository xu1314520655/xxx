import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { projects } from '../data/projects';

const ProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState(projects.find(p => p.id === id));
  const [code, setCode] = useState('');
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    if (project) {
      setCode(project.sampleCode);
    }
  }, [project]);

  const runCode = async () => {
    setIsRunning(true);
    setOutput('运行中...');
    
    // 模拟代码运行
    setTimeout(() => {
      setOutput('代码运行结果：\n\n' + 
        '原始数据形状: (105, 5)\n\n' +
        '数据质量报告:\n' +
        '缺失值统计:\n' +
        'order_id       0\n' +
        'customer_id    7\n' +
        'order_date     0\n' +
        'amount        10\n' +
        'status         0\n' +
        'dtype: int64\n\n' +
        '重复记录数: 5\n\n' +
        '异常值检测（金额>5000）: 5\n\n' +
        '清洗后数据形状: (100, 5)\n' +
        '清洗后缺失值统计:\n' +
        'order_id       0\n' +
        'customer_id    0\n' +
        'order_date     0\n' +
        'amount         0\n' +
        'status         0\n' +
        'dtype: int64\n\n' +
        '清洗后异常值检测（金额>5000）: 0\n\n' +
        '数据已保存为 cleaned_orders.csv'
      );
      setIsRunning(false);
    }, 2000);
  };

  if (!project) {
    return (
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-2xl font-bold mb-4">项目不存在</h1>
        <Link to="/" className="text-blue-600 hover:underline">返回首页</Link>
      </div>
    );
  }

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
          <Link to="/" className="text-xl font-bold">Python数据分析训练平台</Link>
          <div className="flex space-x-4">
            <Link to="/" className="hover:underline">首页</Link>
            <a href="#" className="hover:underline">技术栈</a>
          </div>
        </div>
      </nav>

      {/* 项目详情 */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* 左侧项目信息 */}
          <div className="md:w-1/3">
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="flex justify-between items-start mb-4">
                <h1 className="text-2xl font-bold text-gray-900">
                  项目{project.id}：{project.title}
                </h1>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(project.difficulty)}`}>
                  {project.difficulty === 'beginner' ? '初级' : project.difficulty === 'intermediate' ? '中级' : '高级'}
                </span>
              </div>
              <p className="text-gray-600 mb-6">
                {project.description}
              </p>
              
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-3 text-gray-900">技术要点</h2>
                <ul className="space-y-2">
                  {project.technicalPoints.map((point, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      <span className="text-gray-700">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-3 text-gray-900">任务要求</h2>
                <ul className="space-y-2">
                  {project.tasks.map((task, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-blue-600 mr-2">✓</span>
                      <span className="text-gray-700">{task}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h2 className="text-lg font-semibold mb-3 text-gray-900">数据结构</h2>
                <div className="bg-gray-50 p-4 rounded">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-2">字段名</th>
                        <th className="text-left py-2">类型</th>
                      </tr>
                    </thead>
                    <tbody>
                      {project.dataSchema.columns.map((column, index) => (
                        <tr key={index} className="border-b border-gray-200">
                          <td className="py-2 text-gray-700">{column}</td>
                          <td className="py-2 text-gray-500">{project.dataSchema.types[index]}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
          
          {/* 右侧代码编辑器 */}
          <div className="md:w-2/3">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900">代码编辑器</h2>
                <button 
                  onClick={runCode}
                  disabled={isRunning}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {isRunning ? '运行中...' : '运行代码'}
                </button>
              </div>
              
              {/* 代码编辑区 */}
              <div className="bg-gray-900 text-white rounded-lg p-4 mb-4" style={{ minHeight: '400px' }}>
                <pre className="whitespace-pre-wrap font-mono text-sm">{code}</pre>
              </div>
              
              {/* 运行结果 */}
              <div className="mt-6">
                <h3 className="text-md font-semibold mb-2 text-gray-900">运行结果</h3>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 min-h-[200px]">
                  <pre className="whitespace-pre-wrap font-mono text-sm text-gray-800">{output}</pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 页脚 */}
      <footer className="bg-gray-800 text-white py-8 mt-12">
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

export default ProjectDetail;