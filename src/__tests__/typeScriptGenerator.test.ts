import * as path from 'path';
import * as rimraf from 'rimraf';
import * as fsa from 'fs-extra';
import { testSchema } from './testSchema';
import { executeCommand } from './testUtils';
import { generateTypeScriptTypes } from '../index';
import { versionMajorMinor } from 'typescript';

const outputFolder = path.join(__dirname, 'generatedTypes');

describe('Typescript Generator', () => {
    beforeAll(() => {
        if (fsa.existsSync(outputFolder)) {
            fsa.emptyDirSync(outputFolder);
        } else {
            fsa.mkdirsSync(outputFolder);
        }
    });

    it('should generate unknown custom scalar type as `any`', async () => {
        const outputPath = path.join(outputFolder, 'scalarAsAny.ts');

        await generateTypeScriptTypes(testSchema, outputPath);

        const generated = fsa.readFileSync(outputPath, 'utf-8');
        expect(generated).toMatchSnapshot();
        expect(generated).toContain('export type GQLDate = any;');

        await executeCommand(`tsc --noEmit --lib es6,esnext.asynciterable --target es5 ${outputPath}`);
    });

    it('should generate known scalar type to its corresponding type', async () => {
        const outputPath = path.join(outputFolder, 'scalarAsCustom.ts');

        await generateTypeScriptTypes(testSchema, outputPath, {
            customScalarType: {
                'Date': 'Date'
            }
        });

        const generated = fsa.readFileSync(outputPath, 'utf-8');
        expect(generated).toMatchSnapshot();
        expect(generated).toContain('export type GQLDate = Date;');

        await executeCommand(`tsc --noEmit --lib es6,esnext.asynciterable --target es5 ${outputPath}`);
    });

    it('should use correct tabspaces in config options', async () => {
        const outputPath = path.join(outputFolder, 'tabSpaces.ts');

        await generateTypeScriptTypes(testSchema, outputPath, {
            tabSpaces: 4
        });

        const generated = fsa.readFileSync(outputPath, 'utf-8');
        expect(generated).toMatchSnapshot();

        await executeCommand(`tsc --noEmit --lib es6,esnext.asynciterable --target es5 ${outputPath}`);
    });

    it('should use correct prefix in config options', async () => {
        const outputPath = path.join(outputFolder, 'prefix.ts');

        await generateTypeScriptTypes(testSchema, outputPath, {
            typePrefix: 'MyCustomPrefix'
        });

        const generated = fsa.readFileSync(outputPath, 'utf-8');
        expect(generated).toMatchSnapshot();
        expect(generated).toContain('export interface MyCustomPrefixRootQuery');

        await executeCommand(`tsc --noEmit --lib es6,esnext.asynciterable --target es5 ${outputPath}`);
    });

    xit('should fallback to string union if String Enum is not supported', async () => {
        // TODO: mock ts version and run generator
    });

    it('should wrap types in global if global is configured', async () => {
        const outputPath = path.join(outputFolder, 'global.ts');

        await generateTypeScriptTypes(testSchema, outputPath, {
            global: true
        });

        const generated = fsa.readFileSync(outputPath, 'utf-8');
        expect(generated).toMatchSnapshot();
        expect(generated).toContain('declare global {');

        await executeCommand(`tsc --noEmit --lib es6,esnext.asynciterable --target es5 ${outputPath}`);
    });

    it('should wrap types in namespace if namespace is configured', async () => {
        const outputPath = path.join(outputFolder, 'namespace.ts');

        await generateTypeScriptTypes(testSchema, outputPath, {
            namespace: 'MyNamespace'
        });

        const generated = fsa.readFileSync(outputPath, 'utf-8');
        expect(generated).toMatchSnapshot();
        expect(generated).toContain('namespace MyNamespace {');

        await executeCommand(`tsc --noEmit --lib es6,esnext.asynciterable --target es5 ${outputPath}`);
    });

    it('should have no conflict between global and namespace config', async () => {
        const outputPath = path.join(outputFolder, 'globalWithNamespace.ts');

        await generateTypeScriptTypes(testSchema, outputPath, {
            namespace: 'MyNamespace',
            global: true
        });

        const generated = fsa.readFileSync(outputPath, 'utf-8');
        expect(generated).toMatchSnapshot();
        expect(generated).toContain('declare global {');
        expect(generated).toContain('namespace MyNamespace {');

        await executeCommand(`tsc --noEmit --lib es6,esnext.asynciterable --target es5 ${outputPath}`);
    });
});