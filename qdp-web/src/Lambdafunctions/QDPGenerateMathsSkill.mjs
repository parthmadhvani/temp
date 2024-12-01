export const handler = async (event) => {
    const num1 = Math.floor(Math.random() * 10);
    const num2 = Math.floor(Math.random() * 10);
    const operator = Math.random() > 0.5 ? '+' : '-';
    const problem = `${num1} ${operator} ${num2}`;
    const answer = eval(problem); // Evaluate the problem
  
    return {
        statusCode: 200,
        body: JSON.stringify({ problem, answer })
    };
  };
  