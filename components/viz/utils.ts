import { ethers, BigNumberish } from "ethers";

export interface StorageLayoutEntry {
  slot: string; // The storage slot in hex format (e.g., "0x0")
  label: string; // The variable name or label associated with this storage slot
  offset: number; // The offset within the slot where the variable starts
  size: number; // The size in bytes of the variable's storage space
}

interface ContractStorage {
  [key: string]: string;
}

export async function readNonPrimaryDataType(
  contractStorage: ContractStorage,
  storageLayout: StorageLayoutEntry[],
  variableName: string
): Promise<any> {
  const variableSlot = findSlotForVariable(storageLayout, variableName);

  if (variableSlot !== null) {
    // If the variable exists in the storage layout
    const variableType = findTypeForVariable(storageLayout, variableName);
    if (variableType == null) {
      return null;
    }
    if (variableType === "struct") {
      // If the variable is a struct, read each field separately
      const structFields = findFieldsForStruct(storageLayout, variableName);

      const structData = {};
      for (const field of structFields) {
        const fieldValue = readNonPrimaryDataType(
          contractStorage,
          storageLayout,
          `${variableName}.${field}`
        );
        structData[field] = fieldValue;
      }

      return structData;
    } else if (variableType === "array") {
      // If the variable is an array, read each element separately
      const arrayLength = findArrayLength(storageLayout, variableName);

      const arrayData = [];
      for (let i = 0; i < arrayLength; i++) {
        const arrayElement = readNonPrimaryDataType(
          contractStorage,
          storageLayout,
          `${variableName}[${i}]`
        );
        arrayData.push(arrayElement);
      }

      return arrayData;
    } else {
      // For other non-primary data types, read the value from the corresponding slot
      const slotValue = await getContractStorage(variableSlot); // contractStorage[variableSlot];
      if (slotValue == null) {
        console.log("slot null");
        return null;
      }

      return parseValueAccordingToType(variableType, slotValue);
    }
  } else {
    // If the variable doesn't exist in the storage layout
    return null;
  }
}

// Helper function to find the slot for a variable in the storage layout
function findSlotForVariable(
  storageLayout: StorageLayoutEntry[],
  variableName: string
): string | null {
  const entry = storageLayout.find((item) => item.label === variableName);
  return entry ? entry.slot : null;
}

// Helper function to find the type for a variable in the storage layout
function findTypeForVariable(
  storageLayout: StorageLayoutEntry[],
  variableName: string
): string | null {
  const entry = storageLayout.find((item) => item.label === variableName);
  return entry ? parseTypeFromSlot(entry.slot) : null;
}

// Helper function to parse the type from a slot (you might need to implement this)
function parseTypeFromSlot(slot: string): string | null {
  // Define a mapping of slot patterns to data types
  const slotTypeMapping: Record<string, string> = {
    "0x0": "uint256",
    "0x1": "bool",
    "0x2": "address",
    // Add more slot patterns and corresponding data types here
  };

  // Check if the slot pattern exists in the mapping
  if (slot in slotTypeMapping) {
    return slotTypeMapping[slot];
  } else {
    // If the slot pattern is not found, return null or handle the case accordingly
    return null;
  }
}

// Helper function to find the fields of a struct variable
function findFieldsForStruct(
  storageLayout: StorageLayoutEntry[],
  variableName: string
): string[] {
  const structFields: string[] = [];

  // Iterate through the storageLayout to find fields of the struct
  for (const entry of storageLayout) {
    if (entry.label.startsWith(`${variableName}.`)) {
      // If the entry label starts with the variableName (indicating it's part of the struct)
      // Extract the field name and add it to the structFields array
      const field = entry.label.replace(`${variableName}.`, "");
      structFields.push(field);
    }
  }

  return structFields;
}

// Helper function to find the length of an array variable
function findArrayLength(
  storageLayout: StorageLayoutEntry[],
  variableName: string
): number {
  // Find the entry that corresponds to the array's length slot
  const lengthEntry = storageLayout.find(
    (entry) => entry.label === `${variableName}.length`
  );

  if (lengthEntry) {
    // Calculate the length based on the size of the length slot
    const length = lengthEntry.size / 32; // Assuming each slot holds a uint256 (32 bytes)
    return length;
  }

  // If the length entry is not found, return a default value or handle the case accordingly
  return 0; // Change this to an appropriate default value or error handling
}

// Helper function to parse value according to its type (you might need to implement this)
// function parseValueAccordingToType(type: string, value: string): any {
//   // Implement the logic to parse the value based on its type
// }

// Example usage
const contractStorage = {
  "0x0": "1234", // Replace with actual storage slot values
  "0x1": "5678",
};

// const storageLayout = [
//   // Replace with actual storage layout data
// ];

const storageLayout: StorageLayoutEntry[] = [
  {
    slot: "0x0",
    label: "myUint",
    offset: 0,
    size: 32, // Assuming it's a uint256
  },
  // Other storage layout entries...
];

const variableName = "myStruct";

const result = readNonPrimaryDataType(
  contractStorage,
  storageLayout,
  variableName
);

const getContractStorage = async (position: string) => {
  let signer = null;

  let provider;
  // @ts-ignore
  if (window.ethereum == null) {
    // If MetaMask is not installed, we use the default provider,
    // which is backed by a variety of third-party services (such
    // as INFURA). They do not have private keys installed so are
    // only have read-only access
    console.log("MetaMask not installed; using read-only defaults");
    // provider = ethers.getDefaultProvider();
  } else {
    // Connect to the MetaMask EIP-1193 object. This is a standard
    // protocol that allows Ethers access to make all read-only
    // requests through MetaMask.
    // @ts-ignore
    provider = new ethers.BrowserProvider(window.ethereum);

    // It also provides an opportunity to request access to write
    // operations, which will be performed by the private key
    // that MetaMask manages for the user.
    signer = await provider.getSigner();
  }

  return await provider?.getStorage("", position);
};

function parseValueAccordingToType(type: string, slotValue: string): any {
  // Convert the slotValue from hexadecimal to a BigNumber (assuming you're using ethers.js)
  const bigNumberValue = ethers.toBigInt(slotValue);

  // Determine the data type and parse the value accordingly
  switch (type) {
    case "uint256":
      return ethers.toNumber(bigNumberValue); // Convert to a JavaScript number
    case "bool":
      return bigNumberValue.toString() == ethers.toBigInt(1).toString(); // Check if it's equal to 1 (true)
    case "address":
      return ethers.getAddress(ethers.toBeHex(bigNumberValue)); // Convert to an Ethereum address
    // Add cases for other data types as needed
    default:
      // Handle unsupported data types or custom types
      throw new Error(`Unsupported data type: ${type}`);
  }
}
