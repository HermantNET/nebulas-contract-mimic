// Unmodified source code: https://github.com/nebulasio/go-nebulas/blob/master/nf/nvm/v8/lib/storage.js

"use strict"
var lodash = require("lodash")

class NativeStorage {
  constructor() {
    this.db = {}

    this.get.bind(this)
    this.set.bind(this)
    this.del.bind(this)
  }

  get(key) {
    return lodash.get(this.db, key)
  }
  set(key, val) {
    return lodash.set(this.db, key, val)
  }
  del(key) {
    return lodash.unset(this.db, key)
  }
}

var fieldNameRe = /^[a-zA-Z_$][a-zA-Z0-9_]+$/

var combineStorageMapKey = function(fieldName, key) {
  return "@" + fieldName + "[" + key + "]"
}

var applyMapDescriptor = function(obj, descriptor) {
  descriptor = Object.assign(
    {
      stringify: JSON.stringify,
      parse: JSON.parse,
    },
    descriptor || {}
  )

  if (
    typeof descriptor.stringify !== "function" ||
    typeof descriptor.parse !== "function"
  ) {
    throw new Error(
      "descriptor.stringify and descriptor.parse must be function."
    )
  }

  Object.defineProperty(obj, "stringify", {
    configurable: false,
    enumerable: false,
    get: function() {
      return descriptor.stringify
    },
  })

  Object.defineProperty(obj, "parse", {
    configurable: false,
    enumerable: false,
    get: function() {
      return descriptor.parse
    },
  })
}

var applyFieldDescriptor = function(obj, fieldName, descriptor) {
  descriptor = Object.assign(
    {
      stringify: JSON.stringify,
      parse: JSON.parse,
    },
    descriptor || {}
  )

  if (
    typeof descriptor.stringify !== "function" ||
    typeof descriptor.parse !== "function"
  ) {
    throw new Error(
      "descriptor.stringify and descriptor.parse must be function."
    )
  }

  Object.defineProperty(obj, "__stringify__" + fieldName, {
    configurable: false,
    enumerable: false,
    get: function() {
      return descriptor.stringify
    },
  })

  Object.defineProperty(obj, "__parse__" + fieldName, {
    configurable: false,
    enumerable: false,
    get: function() {
      return descriptor.parse
    },
  })
}

var ContractStorage = function(handler) {
  this.nativeStorage = new NativeStorage(handler)
}

var StorageMap = function(contractStorage, fieldName, descriptor) {
  if (!contractStorage instanceof ContractStorage) {
    throw new Error("StorageMap only accept instance of ContractStorage")
  }

  if (typeof fieldName !== "string" || fieldNameRe.exec(fieldName) == null) {
    throw new Error("StorageMap fieldName must match regex /^[a-zA-Z_$].*$/")
  }

  Object.defineProperty(this, "contractStorage", {
    configurable: false,
    enumerable: false,
    get: function() {
      return contractStorage
    },
  })
  Object.defineProperty(this, "fieldName", {
    configurable: false,
    enumerable: false,
    get: function() {
      return fieldName
    },
  })

  applyMapDescriptor(this, descriptor)
}

StorageMap.prototype = {
  del: function(key) {
    return this.contractStorage.del(combineStorageMapKey(this.fieldName, key))
  },
  get: function(key) {
    var val = this.contractStorage.rawGet(
      combineStorageMapKey(this.fieldName, key)
    )
    if (val != null) {
      val = this.parse(val)
    }
    return val
  },
  set: function(key, value) {
    var val = this.stringify(value)
    return this.contractStorage.rawSet(
      combineStorageMapKey(this.fieldName, key),
      val
    )
  },
}
StorageMap.prototype.put = StorageMap.prototype.set
StorageMap.prototype.delete = StorageMap.prototype.del

ContractStorage.prototype = {
  rawGet: function(key) {
    return this.nativeStorage.get(key)
  },
  rawSet: function(key, value) {
    var ret = this.nativeStorage.set(key, value)
    if (!ret) {
      throw new Error("set key " + key + " failed.")
    }
    return ret
  },
  del: function(key) {
    var ret = this.nativeStorage.del(key)
    if (!ret) {
      throw new Error("del key " + key + " failed.")
    }
    return ret
  },
  get: function(key) {
    var val = this.rawGet(key)
    if (val != null) {
      val = JSON.parse(val)
    }
    return val
  },
  set: function(key, value) {
    return this.rawSet(key, JSON.stringify(value))
  },
  defineProperty: function(obj, fieldName, descriptor) {
    if (!obj || !fieldName) {
      throw new Error("defineProperty requires at least two parameters.")
    }
    var $this = this
    Object.defineProperty(obj, fieldName, {
      configurable: false,
      enumerable: true,
      get: function() {
        var val = $this.rawGet(fieldName)
        if (val != null) {
          val = obj["__parse__" + fieldName](val)
        }
        return val
      },
      set: function(val) {
        val = obj["__stringify__" + fieldName](val)
        return $this.rawSet(fieldName, val)
      },
    })
    applyFieldDescriptor(obj, fieldName, descriptor)
    return this
  },
  defineProperties: function(obj, props) {
    if (!obj || !props) {
      throw new Error("defineProperties requires two parameters.")
    }

    for (const fieldName in props) {
      this.defineProperty(obj, fieldName, props[fieldName])
    }
    return this
  },
  defineMapProperty: function(obj, fieldName, descriptor) {
    if (!obj || !fieldName) {
      throw new Error("defineMapProperty requires two parameters.")
    }

    var mapObj = new StorageMap(this, fieldName, descriptor)
    Object.defineProperty(obj, fieldName, {
      configurable: false,
      enumerable: true,
      get: function() {
        return mapObj
      },
    })
    return this
  },
  defineMapProperties: function(obj, props) {
    if (!obj || !props) {
      throw new Error("defineMapProperties requires two parameters.")
    }

    for (const fieldName in props) {
      this.defineMapProperty(obj, fieldName, props[fieldName])
    }
    return this
  },
}

ContractStorage.prototype.put = ContractStorage.prototype.set
ContractStorage.prototype.delete = ContractStorage.prototype.del

module.exports = Object.freeze({
  ContractStorage: ContractStorage,
  lcs: new ContractStorage(),
})
