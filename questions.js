/**
 * IGCSE Computer Science Chapter 4: Software
 * Comprehensive Question Bank & Stage Scenarios
 */

const CHAPTER4_DATA = {
    // Stage 1: Software Classification Data
    classificationItems: [
        { id: 1, name: "Windows 11 / Linux Kernel", type: "system", sub: "Operating System", description: "Manages hardware, memory, and user interactions" },
        { id: 2, name: "Disk Defragmenter", type: "system", sub: "Utility Program", description: "Reorganizes fragmented files on hard disk to speed up read access" },
        { id: 3, name: "Graphics Driver (NVIDIA)", type: "system", sub: "Device Driver", description: "Translates commands between OS and dedicated GPU hardware" },
        { id: 4, name: "Microsoft Word / Google Docs", type: "application", sub: "General-Purpose", description: "Word processing software for creating documents" },
        { id: 5, name: "Bespoke Bank ATM System", type: "application", sub: "Bespoke Software", description: "Custom-written software created specifically for a bank's ATM hardware" },
        { id: 6, name: "Anti-Virus Scanner", type: "system", sub: "Utility Program", description: "Scans disk for malware, viruses, and security threats" },
        { id: 7, name: "Blender 3D", type: "application", sub: "Open Source Application", description: "Free 3D modeling software with source code publicly available" },
        { id: 8, name: "Printer Firmware / Driver", type: "system", sub: "Device Driver", description: "Allows OS to communicate printing requests to physical hardware" },
        { id: 9, name: "Custom Airport Control System", type: "application", sub: "Bespoke Software", description: "Specially commissioned software for flight radar & landing management" },
        { id: 10, name: "File Compression (WinRAR/7-Zip)", type: "system", sub: "Utility Program", description: "Reduces file sizes using compression algorithms to save disk space" }
    ],

    // Stage 2: OS Functions & Interrupt Scenarios
    interruptScenarios: [
        {
            id: "int_1",
            title: "Printer Paper Out",
            type: "Hardware Interrupt",
            source: "Printer Hardware",
            description: "The printer running on USB Port 2 runs out of paper during a print job.",
            correctISRAction: "Pause print queue, store current CPU state, notify OS to display user message 'Paper Jam / Out of Paper'.",
            options: [
                "Pause print queue, store current CPU state, notify OS to display user message 'Paper Jam / Out of Paper'.",
                "Reboot the computer to reset the RAM buffer immediately.",
                "Ignore signal until the current CPU arithmetic calculation finishes next hour.",
                "Delete all print files from the hard drive."
            ]
        },
        {
            id: "int_2",
            title: "Divide by Zero Error",
            type: "Software Interrupt",
            source: "Executing Program",
            description: "A user program attempts to calculate X = 5 / 0 in memory.",
            correctISRAction: "Trigger arithmetic error interrupt, halt program execution line, output error code to debugger.",
            options: [
                "Trigger arithmetic error interrupt, halt program execution line, output error code to debugger.",
                "Automatically change the answer to 0 and continue without warning.",
                "Send data directly to the printer buffer.",
                "Overwrites OS system files in RAM."
            ]
        },
        {
            id: "int_3",
            title: "Keyboard Keypress Signal",
            type: "Hardware Interrupt",
            source: "Keyboard Controller",
            description: "User hits 'CTRL + ALT + DEL' on keyboard while a full-screen game is running.",
            correctISRAction: "CPU suspends current task, saves registers to stack, jumps to OS Task Manager ISR.",
            options: [
                "CPU suspends current task, saves registers to stack, jumps to OS Task Manager ISR.",
                "Ignore keypress because a full-screen game has higher priority than the OS.",
                "Format the hard drive.",
                "Wipe the keyboard driver from memory."
            ]
        },
        {
            id: "int_4",
            title: "Buffer Overflow Notice",
            type: "Hardware / Software Interrupt",
            source: "RAM Data Buffer",
            description: "Audio buffer filled up while streaming HD sound to speaker hardware.",
            correctISRAction: "Signal CPU buffer is full; briefly pause audio input stream until buffer drains.",
            options: [
                "Signal CPU buffer is full; briefly pause audio input stream until buffer drains.",
                "Dump all audio data permanently.",
                "Crash the computer screen.",
                "Increase CPU clock speed by 500%."
            ]
        }
    ],

    // Stage 3: Translator Cards (Compiler vs Interpreter vs Assembler)
    translatorCards: [
        { id: "t1", statement: "Translates high-level source code into machine code all at once, producing an executable file (.exe).", target: "Compiler" },
        { id: "t2", statement: "Translates high-level code line-by-line and executes it immediately; stops at the first error found.", target: "Interpreter" },
        { id: "t3", statement: "Translates low-level assembly language mnemonics (e.g. LDA, ADD, STO) into binary machine code.", target: "Assembler" },
        { id: "t4", statement: "Takes longer to initially build/compile, but the resulting file runs very quickly without needing original source code.", target: "Compiler" },
        { id: "t5", statement: "Ideal for testing and developing programs because errors are identified line by line as code runs.", target: "Interpreter" },
        { id: "t6", statement: "Used when writing speed-critical code or hardware drivers where direct access to CPU registers is needed.", target: "Assembler" }
    ],

    // Stage 4: IDE Feature Quiz
    ideFeatures: [
        {
            tool: "Code Editor",
            description: "Provides line numbers, color-coded syntax highlighting, and auto-indentation to help write code clearly."
        },
        {
            tool: "Auto-Completion / Context Help",
            description: "Suggests function names, variable names, and parameters as you type to prevent typos."
        },
        {
            tool: "Syntax Checker",
            description: "Highlights code errors in real-time before you even run the program (e.g. missing brackets)."
        },
        {
            tool: "Debugger & Breakpoints",
            description: "Allows step-by-step code execution, pausing at breakpoints to inspect variable values in memory."
        },
        {
            tool: "Translator / Run-time Environment",
            description: "Integrates built-in compilers/interpreters to run the program with one click inside the IDE."
        }
    ],

    // Stage 5: IGCSE Exam Style Questions (Boss Level)
    examQuestions: [
        {
            id: "q1",
            question: "Which of the following best describes the main function of an Operating System (OS)?",
            options: [
                "To manage computer hardware resources, memory, processes, and provide a user interface.",
                "To write source code for bespoke software applications.",
                "To clean physical dust from inside the CPU heatsink.",
                "To convert high-level languages into assembly mnemonics exclusively."
            ],
            correct: 0,
            explanation: "An OS manages hardware (peripherals), memory allocation, multitasking processes, security, and provides CLI/GUI user interfaces."
        },
        {
            id: "q2",
            question: "A company orders software designed specifically to suit their unique inventory requirements. What type of software is this?",
            options: [
                "General-Purpose Software",
                "Bespoke (Custom) Software",
                "System Utility Software",
                "Firmware Utility"
            ],
            correct: 1,
            explanation: "Bespoke software is custom-made for a specific user or business requirement, unlike off-the-shelf general purpose software."
        },
        {
            id: "q3",
            question: "Explain the role of an Interrupt Service Routine (ISR) when a hardware interrupt occurs.",
            options: [
                "The CPU saves current task state, identifies the interrupt source, executes the specific ISR code, then restores the original task.",
                "The CPU immediately wipes RAM and restarts the operating system.",
                "The ISR permanently deletes all user background processes.",
                "The ISR converts high-level Python code into machine code."
            ],
            correct: 0,
            explanation: "When an interrupt occurs, the CPU suspends current execution, saves registers, calls the ISR to handle the signal, and then resumes."
        },
        {
            id: "q4",
            question: "Why is a Compiler preferred over an Interpreter for distributing commercial video games?",
            options: [
                "Compiled code executes faster and does not require the customer to have the original source code or compiler.",
                "Interpreters can only run on 8-bit computers.",
                "Compilers never produce syntax errors.",
                "Compiled games run line-by-line which makes them smoother."
            ],
            correct: 0,
            explanation: "Compilers produce optimized machine code executables that run fast and protect intellectual property by hiding source code."
        },
        {
            id: "q5",
            question: "What is an Assembly Language mnemonic?",
            options: [
                "A short text code (like ADD, SUB, LDA, STO) representing a specific machine code instruction.",
                "A virus scanning algorithm used by utility software.",
                "A type of Graphical User Interface element.",
                "A hardware buffer stored inside a hard disk driver."
            ],
            correct: 0,
            explanation: "Assembly uses short mnemonic codes (e.g. INP, STA, ADD) to represent binary machine instructions for low-level programming."
        },
        {
            id: "q6",
            question: "Which feature of an IDE allows a developer to pause program execution at a specific line to inspect memory?",
            options: [
                "Auto-completion",
                "Breakpoint",
                "Disk Defragmenter",
                "Pretty Printing"
            ],
            correct: 1,
            explanation: "Breakpoints allow developers to pause execution at specific lines to inspect variables and debug logic errors."
        }
    ]
};

if (typeof module !== 'undefined') {
    module.exports = CHAPTER4_DATA;
}
