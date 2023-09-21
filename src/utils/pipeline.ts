type Func = (...args: any[]) => any;

const pipeTwo: (func1: Func, func2: Func) => Func = (func1, func2) => {
  return (...args: any[]) => func2(func1(...args));
};

function pipeline(...fns: Func[]): Func {
  return fns.reduce(pipeTwo);
}

export default pipeline;
