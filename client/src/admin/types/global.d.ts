// Déclarations globales pour les tests
declare namespace NodeJS {
  interface Global {
    describe: jest.Describe;
    it: jest.It;
    expect: jest.Expect;
  }
}

declare const describe: jest.Describe;
declare const it: jest.It;
declare const expect: jest.Expect;

declare namespace jest {
  interface Describe {
    (name: string, fn: () => void): void;
  }

  interface It {
    (name: string, fn: (done?: jest.DoneCallback) => void): void;
  }

  interface Expect {
    <T = any>(actual: T): jest.JestMatchersShape<jest.MatchersShapeToBeNonAny<any, T>, jest.MatchersShapeToBeNonAny<any, T>>;
  }
}
