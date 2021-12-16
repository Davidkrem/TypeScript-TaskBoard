//Instead of bind, will use an autobind decorator
//decorator is function that is called on a class
export function autobind(_: any, _2: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;
  const adjDescriptor = {
    configurable: true,
    get: function () {
      const boundFn = originalMethod.bind(this);
      return boundFn;
    },
  };
  //adjusted descriptor is returned
  return adjDescriptor;
}


