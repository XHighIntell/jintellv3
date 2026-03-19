declare namespace intell {
    export interface EventRegisterOption {
        /** A boolean value indicating that the listener should be invoked at most once after being added. 
         * If true, the listener would be automatically removed when invoked. If not specified, defaults to false. */
        once: boolean;
    } 
}