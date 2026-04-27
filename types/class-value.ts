export type ClassDictionary = Record<string, boolean | null | undefined>;

export type ClassArray = ClassValue[];

export type ClassValue = string | null | undefined | false | ClassDictionary | ClassArray;
