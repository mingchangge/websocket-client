<template>
  <div>
    <h1>前端元编程</h1>
    <p>元编程是指在程序运行时，通过操作代码来实现对程序的控制。</p>
    <p>在前端开发中，元编程可以用于动态生成组件、修改组件行为等。</p>
  </div>
</template>
<script>
export default {
  name: 'MetaProgrammingView',
  data() {
    return {}
  },
  mounted() {
    /*
    // proxy示例
    this.exampleMethod() // 调用示例方法
    this.proxyExample() // 调用代理示例
    // this.proxyRevocableExample() // 调用可撤销代理示例
    this.proxyTrapApply() // 调用代理劫持 apply 方法示例
    this.proxyTrapNew() // 调用代理劫持 new 方法示例
    this.proxyTrapDefineProperty() // 调用代理劫持 defineProperty 方法示例
    this.proxyTrapDeleteProperty() // 调用代理劫持 deleteProperty 方法示例
    // 调用代理劫持 get 方法示例
    this.proxyTrapGet()
    // this.proxyTrapGet2()
    this.proxyTrapSet() // 调用代理劫持 set 方法示例
    // 调用代理劫持 ownKeys 方法示例
    this.proxyTrapOwnKeys()
    // this.proxyTrapOwnKeys2()
    this.proxyTrapGetOwnPropertyDescriptor() // 调用代理劫持 getOwnPropertyDescriptor 方法示例
    // 调用代理劫持 getPrototypeOf 方法示例
    this.proxyTrapGetPrototypeOf()
    // this.proxyTrapGetPrototypeOf2()
    this.proxyTrapHas() // 调用代理劫持 has 方法示例
    this.proxyTrapIsExtensible() // 调用代理劫持 isExtensible 方法示例
    this.proxyTrapPreventExtensions() // 调用代理劫持 preventExtensions 方法示例
    this.proxyTrapSetPrototypeOf() // 调用代理劫持 setPrototypeOf 方法示例
     */
    // reflect 示例
    this.reflectExample() // 调用 Reflect 示例
    // 调用 Reflect construct 示例
    this.reflectConstructExample()
    this.reflectConstructExample2()
    this.reflectDefinePropertyExample() // 调用 Reflect defineProperty 示例
    this.reflectDeletePropertyExample() // 调用 Reflect deleteProperty 示例
    // 调用 Reflect get 示例
    this.reflectGetExample()
    this.reflectGetExample2()
    this.reflectGetOwnPropertyDescriptorExample() // 调用 Reflect getOwnPropertyDescriptor 示例
    this.reflectGetPrototypeOfExample() // 调用 Reflect getPrototypeOf 示例
    this.reflectHasExample() // 调用 Reflect has 示例
    this.reflectIsExtensibleExample() // 调用 Reflect isExtensible 示例
    this.reflectOwnKeysExample() // 调用 Reflect ownKeys 示例
    this.reflectPreventExtensionsExample() // 调用 Reflect preventExtensions 示例
    this.reflectSetExample() // 调用 Reflect set 示例
    this.reflectSetPrototypeOfExample() // 调用 Reflect setPrototypeOf 示例
  },
  methods: {
    // 可以在这里添加元编程相关的方法
    exampleMethod() {
      const list = [1, 2, 3]
      const proxy_list = new Proxy(list, {
        get(target, key, receiver) {
          console.log(
            `--------------key:`,
            key,
            `target:`,
            target,
            `receiver:`,
            receiver
          )
          return Reflect.get(target, key, receiver)
        },
        set(target, key, value, receiver) {
          console.log(
            `key:`,
            key,
            `target:`,
            target,
            `receiver:`,
            receiver,
            `value:`,
            value
          )
          return Reflect.set(target, key, value, receiver)
        }
      })
      proxy_list.push(4) // 设置 4 的值
    },
    // 代理示例
    proxyExample() {
      const obj = {
        name: 'kk',
        age: 18
      }
      const proxyObj = new Proxy(obj, {
        get(target, key) {
          return target[key] || `属性不存在`
        },
        set(target, key, value) {
          target[key] = value
          return true // 返回 true 表示设置成功
        }
      })
      console.log(proxyObj.name) // 输出: kk
      console.log(proxyObj.age) // 输出: 18
      proxyObj.age = 20 // 设置属性
      console.log(proxyObj.age) // 输出: 20
    },
    // 可撤销代理示例
    proxyRevocableExample() {
      const obj = { name: 'll', age: 18 }
      const revocable = Proxy.revocable(obj, {
        get(target, key) {
          return target[key] || `属性不存在`
        },
        set(target, key, value) {
          target[key] = value
          return true // 返回 true 表示设置成功
        }
      })
      console.log(revocable) // 输出: {proxy: Proxy(Object), revoke: ƒ}
      console.log(revocable.proxy.name) // 输出: ll
      revocable.proxy.name = 'ii' // 设置属性
      console.log(revocable.proxy.name) // 输出: ii
      revocable.revoke() // 撤销代理
      console.log(revocable.proxy.name) // 这行代码会报错，因为代理已被撤销
    },
    //proxy劫持apply
    proxyTrapApply() {
      function sum(a, b) {
        return a + b
      }
      const sumProxy = new Proxy(sum, {
        /*
         * thisArg：被调用时的上下文对象。
         * args：被调用时的参数数组。
         */
        apply(target, thisArg, args) {
          console.log(
            `Applying sum function with args: ${args}`,
            `thisArg:`,
            thisArg
          )
          // 输出: Applying sum function with args: 1,2 thisArg: undefined
          return target.apply(thisArg, args) // 调用原函数
        }
      })
      console.log(sumProxy(1, 2)) // 输出: 3
    },
    //proxy劫持new方法
    proxyTrapNew() {
      function Person(name, age) {
        this.name = name
        this.age = age
      }
      const personProxy = new Proxy(Person, {
        construct(target, args, newTarget) {
          console.log(
            `Creating a new person with name: ${args[0]} and age: ${args[1]}`,
            `newTarget:`,
            newTarget
          )
          // 输出: Creating a new person with name: John and age: 30 newTarget: Proxy(Function) {length: 2, name: 'Person', prototype: {…}}
          return new target(...args)
        }
      })
      const person = new personProxy('John', 30)
      console.log(person) // 输出: Person { name: 'John', age: 30 }
      /*
      var p = new Proxy(function () {}, {
        construct: function (target, argumentsList, newTarget) {
          return 1
        }
      })

      new p()
      // 输出报错: TypeError:'construct' on proxy: trap returned non-object ('1')
       */
      /*
      // 代理初始化时，传给它的target必须具有一个有效的构造函数供new操作符调用
      var p = new Proxy(
        {},
        {
          construct: function (target, argumentsList, newTarget) {
            return {}
          }
        }
      )

      new p()
      // 输出报错: TypeError: p is not a constructor
       */
    },
    // proxy劫持defineProperty
    proxyTrapDefineProperty() {
      var p = new Proxy(
        {},
        {
          defineProperty(target, prop, descriptor) {
            console.log(descriptor) //输出：{value: 'proxy'}
            return Reflect.defineProperty(target, prop, descriptor)
          }
        }
      )

      Object.defineProperty(p, 'name', {
        value: 'proxy',
        type: 'custom'
      })
      console.log(p.name) // 输出：proxy
      console.log(Object.getOwnPropertyDescriptor(p, 'name'))
      //输出：{value: 'proxy', writable: false, enumerable: false, configurable: false}
      console.log(p) // 输出：Proxy(Object) {name: 'proxy'}
    },
    //proxy劫持deleteProperty
    proxyTrapDeleteProperty() {
      const proxyObj = new Proxy(
        { name: 'kk', age: 18 },
        {
          deleteProperty(target, key) {
            console.log(`Deleting property: ${key}`) // 输出: Deleting property: age, name1
            return Reflect.deleteProperty(target, key)
          }
        }
      )
      delete proxyObj.age // 删除 age 属性
      console.log(proxyObj) // 输出: { name: 'kk' }
      delete proxyObj.name1 // 删除 name1 属性
    },
    // proxy劫持get
    proxyTrapGet() {
      const proxyObj = new Proxy(
        { a: 10 },
        {
          get(target, key) {
            console.log(`Accessing property: ${key}`) // 输出: Accessing property: age, name1
            return target[key] || `属性不存在`
          }
        }
      )
      console.log(proxyObj.a) // 输出: 10
      console.log(proxyObj.b) // 输出: 属性不存在

      /*
      const target = {}
      // 定义一个只有 setter 的属性
      Object.defineProperty(target, 'secret', {
        set(v) {},
        get: undefined, // 没有 getter → [[Get]] 为 undefined
        configurable: false //必须为 false，否则不会抛出错误，直接返回proxy get设置的值
      })

      const proxy = new Proxy(target, {
        get(t, prop, receiver) {
          return 'fake-value' // 返回一个假的值
        }
      })

      console.log(proxy.secret)
      // 输出报错: TypeError: 'get' on proxy: property 'secret' is a non-configurable accessor property on the proxy target and does not have a getter function, but the trap did not return 'undefined' (got 'fake-value')
       */
    },
    proxyTrapGet2() {
      const obj = {}
      Object.defineProperty(obj, 'a', {
        configurable: false,
        enumerable: false,
        writable: false,
        value: '1'
      })
      const proxyObj = new Proxy(obj, {
        get(target, key) {
          console.log(`Accessing property: ${key}`) // 输出: Accessing property: age, name1
          return 101
        }
      })
      console.log(proxyObj.a)
      // 输出报错: mounted hook: "TypeError: 'get' on proxy: property 'a' is a read-only and non-configurable data property on the proxy target but the proxy did not return its actual value (expected '1' but got '101')"
    },
    // proxy劫持set
    proxyTrapSet() {
      const proxy1 = new Proxy(
        { eyeCount: 4 },
        {
          set(target, prop, value, receiver) {
            if (prop === 'eyeCount' && value % 2 !== 0) {
              console.log('Monsters must have an even number of eyes')
              return true // 重要，必须返回布尔值，表示设置是否成功
            } else {
              return Reflect.set(target, prop, value, receiver)
            }
          }
        }
      )
      proxy1.eyeCount = 1
      console.log(proxy1.eyeCount) //输出：4
      proxy1.eyeCount = 2
      console.log(proxy1.eyeCount) //输出：2
      /*
      const target = {}
      Object.defineProperty(target, 'id', {
        value: 42,
        writable: false,
        configurable: false // 永久只读
      })

      const proxy = new Proxy(target, {
        set(t, prop, val) {
          // 无论返回 false 还是强行 Reflect.set
          // 引擎都会检测到冲突并抛 TypeError
          return Reflect.set(t, prop, val) // 这里会返回 false
        }
      })

      proxy.id = 99
      // 输出报错: TypeError: 'set' on proxy: trap returned falsish for property 'id'
       */
      /*
        const target = {
            _name: 'Tom'
        }

        // 仅定义 getter，没有 setter
        Object.defineProperty(target, 'name', {
            get() {
            return this._name
            },
            set: undefined // 显式声明无 setter
        })

        const proxy = new Proxy(target, {
            set(t, prop, val) {
            return Reflect.set(t, prop, val) // 会返回 false
            }
        })

        proxy.name = 'Jerry'
        // 输出报错: TypeError: 'set' on proxy: trap returned falsish for property 'name'
     */
    },
    // proxy劫持ownKeys
    proxyTrapOwnKeys() {
      const monster1 = {
        _age: 111,
        [Symbol('secret')]: 'I am scared!',
        eyeCount: 4
      }
      const handler1 = {
        ownKeys(target) {
          return Reflect.ownKeys(target)
        }
      }
      const proxy1 = new Proxy(monster1, handler1)
      for (const key of Object.keys(proxy1)) {
        console.log('Object.keys:*******', key) // 输出: _age eyeCount
      }
      for (const key of Object.getOwnPropertyNames(proxy1)) {
        console.log('Object.getOwnPropertyNames:-----', key) // 输出: _age eyeCount
      }
      for (const key of Object.getOwnPropertySymbols(proxy1)) {
        console.log('Object.getOwnPropertySymbols:++++++', key.toString()) // 输出: Symbol(secret)
      }
      for (const key in proxy1) {
        console.log('for...in:******', key.toString()) // 输出: Symbol(secret)
      }
      for (const key of Reflect.ownKeys(proxy1)) {
        console.log('Reflect.ownKeys:-----', key) // 现在会输出: _age, eyeCount, Symbol(secret)
      }
      //   const target = {}
      //   Object.defineProperty(target, 'x', { value: 1, configurable: false })
      //   const proxy = new Proxy(target, {
      //     ownKeys() {
      //       return [] // ❌ 漏了不可配置的 'x'，会抛 TypeError
      //     }
      //   })
      //   Object.keys(proxy)
      // 输出报错：TypeError: 'ownKeys' on proxy: trap result did not include 'x'
      //   const target = { a: 1 }
      //   Object.preventExtensions(target)

      //   const proxy = new Proxy(target, {
      //     ownKeys() {
      //       return ['a', 'b'] // ❌ 多了 'b'，会抛 TypeError
      //     }
      //   })

      //   Object.keys(proxy) // TypeError: 'ownKeys' on proxy
    },
    proxyTrapOwnKeys2() {
      var p = new Proxy(
        {},
        {
          ownKeys: function (target) {
            // 下面的返回类型都会报错
            return [123, 12.5, true, false, undefined, null, {}, []]
          }
        }
      )
      console.log(Object.getOwnPropertyNames(p))
      //输出报错：TypeError: 123 is not a valid property name
    },
    // proxy劫持getOwnPropertyDescriptor
    proxyTrapGetOwnPropertyDescriptor() {
      const proxyObj = new Proxy(
        {
          name: 'kk',
          age: 18
        },
        {
          getOwnPropertyDescriptor: (target, key) =>
            Reflect.getOwnPropertyDescriptor(target, key)
        }
      )
      console.log(Object.getOwnPropertyDescriptor(proxyObj, 'name'))
      // 输出: { value: 'kk', writable: true, enumerable: true, configurable: true }
      /*
        const target = {}
        Object.defineProperty(target, 'x', { value: 1, configurable: false })
        const proxy = new Proxy(target, {
        getOwnPropertyDescriptor(t, prop) {
            if (prop === 'x') return undefined // ❌ 撒谎
        }
        })
        Object.getOwnPropertyDescriptor(proxy, 'x')
        // 输出报错：TypeError: 'getOwnPropertyDescriptor' on proxy: trap returned undefined for property 'x' which is non-configurable in the proxy target
     */
      /*
        const target = { y: 2 }
        Object.preventExtensions(target)

        const proxy = new Proxy(target, {
            getOwnPropertyDescriptor(t, prop) {
            if (prop === 'y') return undefined // ❌ 撒谎
            }
        })

        Object.getOwnPro pertyDescriptor(proxy, 'y')
        // 输出报错：TypeError: 'getOwnPropertyDescriptor' on proxy: trap returned undefined for property 'y' which exists in the non-extensible proxy target
      */
      /*
      const target = {}
      Object.preventExtensions(target)

      const proxy = new Proxy(target, {
        getOwnPropertyDescriptor(t, prop) {
          if (prop === 'z') return { value: 99, configurable: true } // ❌ 伪造
        }
      })

      Object.getOwnPropertyDescriptor(proxy, 'z')
      // 输出报错：TypeError: 'getOwnPropertyDescriptor' on proxy: trap returned descriptor for property 'z' that is incompatible with the existing property in the proxy target
     */
      /*
      const target = { w: 3 } // w 默认 configurable: true
      const proxy = new Proxy(target, {
        getOwnPropertyDescriptor(t, prop) {
          if (prop === 'w') return { value: 3, configurable: false } // ❌ 撒谎
        }
      })

      Object.getOwnPropertyDescriptor(proxy, 'w')
      // 输出报错：peError: 'getOwnPropertyDescriptor' on proxy: trap reported non-configurability for property 'w' which is either non-existent or configurable in the proxy target
     */
      /*
      const target = {}
      const proxy = new Proxy(target, {
        getOwnPropertyDescriptor(t, prop) {
          // ❌ 返回了一个不可用的 getter：不是函数
          if (prop === 'bad') {
            return { get: 123, enumerable: true, configurable: true }
          }
        }
      })

      Object.getOwnPropertyDescriptor(proxy, 'bad')
      //输出报错：TypeError: Getter must be a function: 123
    */
    },
    // proxy劫持getPrototypeOf
    proxyTrapGetPrototypeOf() {
      const monster1 = {
        eyeCount: 4
      }
      const monsterPrototype = {
        eyeCount: 2
      }
      const proxy1 = new Proxy(monster1, {
        getPrototypeOf(target) {
          // 这里直接返回自定义的原型对象
          return monsterPrototype //替换了目标对象的真实原型
        }
      })
      console.log(Object.getPrototypeOf(proxy1) === monsterPrototype)
      // 输出: true
      console.log(Object.getPrototypeOf(proxy1).eyeCount)
      // 输出: 2
    },
    proxyTrapGetPrototypeOf2() {
      var p = new Proxy(
        {},
        {
          getPrototypeOf(target) {
            return Array.prototype
          }
        }
      )
      console.log(Object.getPrototypeOf(p) === Array.prototype) // 输出: true
      console.log(Reflect.getPrototypeOf(p) === Array.prototype) // 输出: true
      console.log(p.__proto__ === Array.prototype) // 输出: true
      console.log(Array.prototype.isPrototypeOf(p)) // 输出: true
      console.log(p instanceof Array) // 输出: true
      var obj = Object.preventExtensions({})
      var p = new Proxy(obj, {
        getPrototypeOf(target) {
          return {}
        }
      })
      Object.getPrototypeOf(p)
      //报错：TypeError: 'getPrototypeOf' on proxy: proxy target is non-extensible but the trap did not return its actual prototype
    },
    //proxy劫持has
    proxyTrapHas() {
      const proxyObj = new Proxy(
        { name: 'kk', age: undefined, height: null },
        {
          has(target, key) {
            return key in target // 返回 true 或 false
          }
        }
      )
      console.log('name' in proxyObj) // 输出: true
      console.log('age' in proxyObj) // 输出: true
      console.log('height' in proxyObj) // 输出: true
      console.log('weight' in proxyObj) // 输出: false
      /*
      with (proxyObj) {
        console.log('name' in proxyObj) // 输出: true
        console.log('age' in proxyObj) // 输出: true
        console.log('height' in proxyObj) // 输出: true
        console.log('weight' in proxyObj) // 输出: false
      } */

      /* var obj = { a: 10 }
      Object.preventExtensions(obj)
      var p = new Proxy(obj, {
        has: function (target, prop) {
          return false
        }
      })

      'a' in p
      // 输出报错 ：TypeError: 'has' on proxy: trap returned falsish for property 'a' but the proxy target is not extensible
      */
    },
    // proxy劫持isExtensible
    proxyTrapIsExtensible() {
      const proxyObj = new Proxy(
        {},
        {
          isExtensible(target) {
            return Reflect.isExtensible(target) // 返回目标对象的可扩展性
          },
          preventExtensions(target) {
            console.log('Preventing extensions on target')
            return Reflect.preventExtensions(target) // 阻止扩展
          }
        }
      )
      console.log(Object.isExtensible(proxyObj)) // 输出: true
      Object.preventExtensions(proxyObj) // 阻止扩展
      console.log(Object.isExtensible(proxyObj)) // 输出: false
      /*
      var p = new Proxy(
        {},
        {
          isExtensible: function (target) {
            return false // return 0; return NaN 等都会报错
          }
        }
      )

      Object.isExtensible(p)
      //输出报错：TypeError: 'isExtensible' on proxy: trap result does not reflect extensibility of proxy target (which is 'true')
       */
    },
    //proxy劫持preventExtensions
    proxyTrapPreventExtensions() {
      const target = {
        isExtensible: true
      }
      const proxyObj = new Proxy(target, {
        preventExtensions(target) {
          target.isExtensible = false
          Object.preventExtensions(target)
          return true
        }
      })
      console.log(target.isExtensible) // 输出: true
      Object.preventExtensions(proxyObj) // 阻止扩展
      console.log(target.isExtensible) // 输出: false
      console.log(Object.isExtensible(proxyObj)) // 输出: false
      console.log(Object.isExtensible(target)) // 输出: false
      /*
      var p = new Proxy(
        {},
        {
          preventExtensions: function (target) {
            return true
          }
        }
      )

      Object.preventExtensions(p)
      // 输出报错：TypeError: 'preventExtensions' on proxy: trap returned truish but the proxy target is extensible
     */
    },
    //proxy劫持setPrototypeOf
    proxyTrapSetPrototypeOf() {
      const proxyObj = new Proxy(
        {},
        {
          setPrototypeOf(target, proto) {
            console.log(`Setting prototype to:`, proto)
            return Reflect.setPrototypeOf(target, proto) // 设置原型
          }
        }
      )
      Object.setPrototypeOf(proxyObj, Array.prototype) // 设置原型为 Array.prototype
      console.log(Object.getPrototypeOf(proxyObj) === Array.prototype) // 输出: true
    },
    // Reflect apply示例
    reflectExample() {
      console.log(Reflect.apply(Math.floor, undefined, [1.75])) // 输出: 1
    },
    // Reflect construct示例
    reflectConstructExample() {
      const Person = function (name, age) {
        this.name = name
        this.age = age
      }
      const person = Reflect.construct(Person, ['John', 30])
      console.log(person) // 输出: Person { name: 'John', age: 30 }
    },
    reflectConstructExample2() {
      const OneClass = function () {
        this.name = 'oneClass'
      }
      const TwoClass = function () {
        this.name = 'twoClass'
      }
      const obj = Reflect.construct(OneClass, [])
      console.log(obj) // 输出: OneClass {name: 'oneClass'}
      console.log(obj instanceof OneClass) // 输出: true
      console.log(obj instanceof TwoClass) // 输出: false
      // 原型指向 TwoClass.prototype
      const obj1 = Reflect.construct(OneClass, [], TwoClass)
      console.log(obj1) // 输出: TwoClass {name: 'oneClass'}
      console.log(obj1 instanceof OneClass) // 输出: false
      console.log(obj1 instanceof TwoClass) // 输出: true
      //Reflect.construct之前的原型指向 TwoClass.prototype实现方法
      const obj2 = Object.create(TwoClass.prototype) // object.create 创建一个新对象，原型指向 TwoClass.prototype
      OneClass.call(obj2) // “借用” OneClass 的构造函数逻辑来初始化 obj2，对 OneClass 本身及其原型链无影响。
      console.log(obj2) // 输出: TwoClass {name: 'oneClass'}
      console.log(obj2 instanceof OneClass) // 输出: false
      console.log(obj2 instanceof TwoClass) // 输出: true
    },
    // Reflect defineProperty示例
    reflectDefinePropertyExample() {
      let obj = {}
      Reflect.defineProperty(obj, 'name', {
        value: 'kk'
      })
      console.log(obj.name) // 输出: kk
      console.log(Object.getOwnPropertyDescriptor(obj, 'name'))
      //输出：{value: 'kk', writable: false, enumerable: false, configurable: false}
    },
    // Reflect deleteProperty示例
    reflectDeletePropertyExample() {
      let obj = {
        name: 'kk',
        age: 18
      }

      console.log(Reflect.deleteProperty(obj, 'name')) // 输出: true
      console.log(obj) // 输出: { age: 18 }
      // 尝试删除被冻结的属性会失败
      Object.freeze(obj)
      console.log(Reflect.deleteProperty(obj, 'age')) // 输出: false
      // 尝试删除不存在的属性会返回 true
      console.log(Reflect.deleteProperty(obj, 'number')) // 输出: true
      var arr = [1, 2, 3, 4, 5]
      Reflect.deleteProperty(arr, '3') // true
      console.log(arr, arr.length) // 输出: [1, 2, 3, empty, 5] 5
    },
    // Reflect get示例
    reflectGetExample() {
      let obj = {
        name: 'kk',
        age: 18
      }
      console.log(Reflect.get(obj, 'name')) // 输出: kk
      console.log(Reflect.get(obj, 'number')) // 输出: undefined
      let arr = [1, 2]
      console.log(Reflect.get(arr, 0)) // 输出: 1
      console.log(Reflect.get(arr, 2)) // 输出: undefined
    },
    reflectGetExample2() {
      let obj = {
        name: 'kk',
        get greeting() {
          return `Hello, ${this.name}!`
        }
      }
      console.log(Reflect.get(obj, 'greeting')) // 输出: Hello, kk!
      const receiver = { name: 'll' }
      console.log(Reflect.get(obj, 'greeting', receiver)) // 输出: Hello, ll!
    },
    //Reflect getOwnPropertyDescriptor示例
    reflectGetOwnPropertyDescriptorExample() {
      let obj = {
        name: 'kk',
        age: 18
      }
      console.log(Reflect.getOwnPropertyDescriptor(obj, 'name'))
      // 输出: {value: 'kk', writable: true, enumerable: true, configurable: true}
      console.log(Reflect.getOwnPropertyDescriptor(obj, 'number')) // 输出: undefined
      console.log(Reflect.getOwnPropertyDescriptor([], 'length'))
      // 输出: {value: 0, writable: true, enumerable: false, configurable: false}
      // 尝试获取非对象的属性描述符
      console.log(Object.getOwnPropertyDescriptor('a', '0'))
      //输出: {value: 'a', writable: false, enumerable: true, configurable: false}
      // console.log(Reflect.getOwnPropertyDescriptor('a', '0'))
      // 输出报错: TypeError: Reflect.getOwnPropertyDescriptor called on non-object
    },
    //Reflect getPrototypeOf示例
    reflectGetPrototypeOfExample() {
      const object1 = {
        property1: 42
      }
      const proto1 = Reflect.getPrototypeOf(object1)
      console.log(proto1)
      // 输出: {constructor: ƒ, __defineGetter__: ƒ, __defineSetter__: ƒ, hasOwnProperty: ƒ, __lookupGetter__: ƒ, …}
      console.log(Reflect.getPrototypeOf({}))
      // 输出: {constructor: ƒ, __defineGetter__: ƒ, __defineSetter__: ƒ, hasOwnProperty: ƒ, __lookupGetter__: ƒ, …}
      console.log(Reflect.getPrototypeOf(Reflect.getPrototypeOf({}))) // 输出: null
      console.log(Reflect.getPrototypeOf(proto1)) // 输出: null
      // 在 ES2015 规范下，Reflect 抛异常，Object 强制转换非 Object 类型
      console.log(Object.getPrototypeOf('foo')) // 输出:  String {'', constructor: ƒ, anchor: ƒ, at: ƒ, big: ƒ, …}
      // console.log(Reflect.getPrototypeOf('foo')) // 输出报错: TypeError: Reflect.getPrototypeOf called on non-object
    },
    // Reflect has示例
    reflectHasExample() {
      let obj = {
        name: 'kk',
        age: 18
      }
      console.log(Reflect.has(obj, 'name')) // 输出: true
      console.log(Reflect.has(obj, 'number')) // 输出: false
      console.log(Reflect.has([], 'length')) // 输出: true
      // Reflect.has 可以用于检查数组的索引
      console.log(Reflect.has([1, 2, 3], '0')) // 输出: true
      console.log(Reflect.has([], '0')) // 输出: false
      console.log(Reflect.has([0], '1')) // 输出: false
      // Reflect.has 也可以用于检查 Symbol 属性
      let sym = Symbol('test')
      obj[sym] = 'symbol value'
      console.log(Reflect.has(obj, sym)) // 输出: true
    },
    // Reflect isExtensible示例
    reflectIsExtensibleExample() {
      let obj = {}
      console.log(Reflect.isExtensible(obj)) // 输出: true
      Object.preventExtensions(obj) // 阻止扩展
      console.log(Reflect.isExtensible(obj)) // 输出: false
      let sealedObj = Object.seal({ name: 'kk' })
      console.log(Reflect.isExtensible(sealedObj)) // 输出: false
      let frozenObj = Object.freeze({ age: 18 })
      console.log(Reflect.isExtensible(frozenObj)) // 输出: false
      // Reflect.isExtensible 也可以用于检查数组
      let arr = [1, 2, 3]
      console.log(Reflect.isExtensible(arr)) // 输出: true
      Object.preventExtensions(arr) // 阻止扩展
      console.log(Reflect.isExtensible(arr)) // 输出: false
      // 尝试在不可扩展的字符串上使用 Reflect.isExtensible
      // console.log(Reflect.isExtensible('hello'))
      // 输出报错: TypeError: Reflect.isExtensible called on non-object
    },
    // Reflect ownKeys示例
    reflectOwnKeysExample() {
      let obj = {
        [Symbol.for('comet')]: 'comet',
        name: 'kk',
        age: 18,
        773: 773,
        0: 0,
        '-1': '-1',
        [Symbol.for('meteor')]: 'meteor'
      }
      console.log(Reflect.ownKeys(obj))
      // 输出:  ['0', '773', 'name', 'age', '-1', Symbol(comet), Symbol(meteor)]
      let arr = [1, 2, 3]
      console.log(Reflect.ownKeys(arr))
      // 输出: ['0', '1', '2', 'length']
    },
    // Reflect preventExtensions示例
    reflectPreventExtensionsExample() {
      let obj = {
        name: 'kk',
        age: 18
      }
      console.log(Reflect.preventExtensions(obj)) // 输出: true
      console.log(Reflect.isExtensible(obj)) // 输出: false

      console.log(Object.preventExtensions(1))
      // 输出: 1
      // console.log(Reflect.preventExtensions(1))
      // 输出报错: TypeError: Reflect.preventExtensions called on non-object
    },
    // Reflect set示例
    reflectSetExample() {
      let obj = {
        name: 'kk',
        age: 18
      }
      console.log(Reflect.set(obj, 'name', 'll')) // 输出: true
      console.log(obj.name) // 输出: ll
      console.log(Reflect.set(obj, 'age', 20)) // 输出: true
      console.log(obj.age) // 输出: 20
      // console.log(Reflect.set('hello', 0, 'a'))
      // 输出报错: TypeError: Reflect.set called on non-object
    },
    // Reflect setPrototypeOf示例
    reflectSetPrototypeOfExample() {
      let obj = {}
      console.log(Reflect.setPrototypeOf(obj, null)) // 输出: true
      // let obj2 = Object.freeze({})
      // console.log(Reflect.setPrototypeOf(obj2, null)) // 输出: false
      // let obj2_1 = Object.freeze(obj)
      // console.log(Reflect.setPrototypeOf(obj2_1, null))
      // // 输出: true，因为 Object.freeze() 冻结的对象的原型已经是 null，再次设置null返回true
      // console.log(Reflect.setPrototypeOf(obj2_1, {})) // 输出: false
      let obj3 = Object.seal({})
      console.log(Reflect.setPrototypeOf(obj3, null)) // 输出: false
      let obj3_1 = Object.seal(obj)
      console.log(Reflect.setPrototypeOf(obj3_1, null)) // 输出: true
      console.log(Reflect.setPrototypeOf(obj3_1, {})) // 输出: false
      let obj4 = Object.preventExtensions({})
      console.log(Reflect.setPrototypeOf(obj4, null)) // 输出: false
      let obj4_1 = Object.preventExtensions(obj)
      console.log(Reflect.setPrototypeOf(obj4_1, null)) // 输出: true
      console.log(Reflect.setPrototypeOf(obj4_1, {})) // 输出: false
      const target = {}
      const proto = Object.create(target)
      console.log(Reflect.setPrototypeOf(target, proto)) // 输出: false
    }
  }
}
</script>
