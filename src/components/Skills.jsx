import React from 'react';

const Skills = () => {
  const skillsList = ['React', 'Vue', 'Next.js', 'Laravel', 'Node.js', 'Flutter'];

  return (
    <div className="flex flex-row flex-wrap gap-3 mt-6 justify-left w-full">
      {skillsList.map((skill) => (
        <div
          key={skill}
          className="px-5 py-2 text-sm text-white transition-all duration-300 ease-in-out border rounded-full cursor-pointer border-white/20 bg-gradient-to-r from-orange-500 via-red-500 to-yellow-400 hover:opacity-90 shadow-md shadow-red-500"
        >
          {skill}
        </div>
      ))}
    </div>
  );
};

export default Skills;
