import { ChildProcess, execSync } from "child_process";
import opentelemetry, { trace, context, propagation, Span } from "@opentelemetry/api";


const getGitRoot = (): string => {
    const result = execSync("git rev-parse --show-toplevel")
    return result.toString()
}

// Check is repo exists, 
const checkGitRepository = (): string | undefined => {
    const result = execSync("git status")
    try {
        return result.toString().split("\n")[0].split("On branch ")[1]
    } catch {
        return undefined
    }
}

const parseGitReflog = (): Object => {
    const branchName = checkGitRepository()
    if (branchName) {
        const result = execSync("git reflog --decorate")
        const lines = result.toString().split("\n")
        for (const line of lines) {
            const substrings = line.split(": ")
            if (substrings[1] === "commit") {

            }
            const wholeDetailsString = substrings[0].replace('(', ')')
            const commit_details = wholeDetailsString.split(")")
            console.log(commit_details)
            const commit_id = commit_details[0].slice(0, commit_details[0].length - 2)
            console.log(commit_id)
            const branches = commit_details[1].split("-> ")[1].split(", ")
            console.log(branches)
            console.log(branchName)
            const message = substrings[-1]
            // the first commit entry should start with current branch
            if (branches[0] === branchName) {
                const branch = branches[0]
                console.log("here")
                return { commit_id, branch, message }
            }
        }

    }
    return { commit_id: undefined, branch: undefined, message: undefined }
}

const checkGit = checkGitRepository()
const git_root = checkGit ? getGitRoot() : undefined
// @ts-ignore
const { commit_id, branch, message } = checkGit ? parseGitReflog() : { commit_id: undefined, branch: undefined, message: undefined }

function _getCallerFile() {
    var filename;

    var _pst = Error.prepareStackTrace
    Error.prepareStackTrace = function (err, stack) { return stack; };
    try {
        var err: Error = new Error();
        let found = false;
        for (const span of err.stack) {
            // Find the first file in the call stack that is not from trace_utils
            // @ts-ignore
            if (span.getFileName() !== __dirname) {
                found = true
                // @ts-ignore
                filename = span.getFileName()
                break;
            }
        }

        if (!found) {
            console.log("Could not find caller file in stack")
        }
    } catch (err) { }
    Error.prepareStackTrace = _pst;

    return filename;
}


const tracer = opentelemetry.trace.getTracer(
    'my-service-tracer'
);

export function traceFunction(target: any, propertyName: string, descriptor: TypedPropertyDescriptor<Function>) {
    let method = descriptor.value!;

    descriptor.value = function (...args: any[]) {
        return tracer.startActiveSpan(propertyName, (span) => {
            method.apply(this, args)
            setSpanAttributes(propertyName, this, span)
            span.end()
        });
    };
}

const setSpanAttributes = (name: string, context: Object, span: Span) => {
    const filePath = _getCallerFile()
    const pathFromGitRoot = filePath.replace(git_root, '')

    const qualName = context && context.constructor ? context.constructor.name + ":" + name : name
    span.setAttribute("qualName", qualName)
    span.setAttribute("file", pathFromGitRoot)
    if (checkGit) {
        span.setAttribute("commit_id", commit_id)
        span.setAttribute("branch", branch)
        span.setAttribute("message", message)
    }
}


export const traceFunctionMiddleWare = (req, res, next) => {
    return tracer.startActiveSpan(req.originalUrl, (span) => {
        setSpanAttributes(req.originalUrl, undefined, span)
        next()
        span.end()
    });
}


export const getTraceStateHeader = () => {
    const output = {}
    propagation.inject(context.active(), output);
    return output
}

