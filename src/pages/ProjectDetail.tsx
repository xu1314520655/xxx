import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { projects } from '../data/projects';
import { loadPyodide } from 'pyodide';

const ProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState(projects.find(p => p.id === id));
  const [code, setCode] = useState('');
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [pyodide, setPyodide] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAnswer, setShowAnswer] = useState(false);

  useEffect(() => {
    if (project) {
      setCode(project.sampleCode);
    }
  }, [project]);

  // 加载 Pyodide
  useEffect(() => {
    const initPyodide = async () => {
      try {
        const pyodideInstance = await loadPyodide({
          indexURL: "https://cdn.jsdelivr.net/pyodide/v0.29.3/full/"
        });
        // 安装 pandas 和 numpy
        await pyodideInstance.loadPackage(["pandas", "numpy"]);
        setPyodide(pyodideInstance);
        setIsLoading(false);
      } catch (error) {
        console.error("Failed to load Pyodide:", error);
        setIsLoading(false);
        setOutput("加载 Pyodide 失败，请刷新页面重试");
      }
    };
    initPyodide();
  }, []);

  const runCode = async () => {
    if (!pyodide) {
      setOutput("Pyodide 尚未加载完成，请稍候");
      return;
    }

    setIsRunning(true);
    setOutput('运行中...');
    
    try {
      // 重定向标准输出
      let outputContent = '';
      pyodide.globals.set('print', (text: any) => {
        outputContent += text + '\n';
      });

      // 执行代码
      await pyodide.runPythonAsync(code);
      
      // 显示输出
      if (outputContent) {
        setOutput('代码运行结果：\n\n' + outputContent);
      } else {
        setOutput('代码执行成功，但没有输出');
      }
    } catch (error: any) {
      setOutput('代码执行错误：\n\n' + error.message);
    } finally {
      setIsRunning(false);
    }
  };

  const resetCode = () => {
    if (project) {
      setCode(project.sampleCode);
      setOutput('');
    }
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
              
              <div className="mb-6">
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

              <div>
                <button
                  onClick={() => setShowAnswer(!showAnswer)}
                  className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-700 transition"
                >
                  {showAnswer ? '隐藏答案解析' : '查看答案解析'}
                </button>
              </div>
            </div>

            {/* 答案解析区域 */}
            {showAnswer && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-lg font-semibold mb-3 text-gray-900">答案解析</h2>
                <div className="bg-purple-50 p-4 rounded text-gray-700 whitespace-pre-line">
                  {project.answerExplanation}
                </div>
              </div>
            )}
          </div>
          
          {/* 右侧代码编辑器 */}
          <div className="md:w-2/3">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900">代码编辑器</h2>
                <div className="flex space-x-2">
                  <button
                    onClick={resetCode}
                    className="bg-gray-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-600 transition"
                  >
                    重置代码
                  </button>
                  <button 
                    onClick={runCode}
                    disabled={isRunning || isLoading}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {isLoading ? '加载中...' : isRunning ? '运行中...' : '运行代码'}
                  </button>
                </div>
              </div>
              
              {/* 代码编辑区 */}
              <div className="mb-4">
                <textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full h-96 bg-gray-900 text-green-400 font-mono text-sm p-4 rounded-lg border-2 border-gray-700 focus:border-blue-500 focus:outline-none resize-none"
                  placeholder="在此输入 Python 代码..."
                />
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
