import React, { Component } from 'react';
import AceEditor from 'react-ace';
import 'ace-builds/src-noconflict/mode-markdown';
import 'ace-builds/src-noconflict/mode-javascript';
import 'ace-builds/src-noconflict/mode-java';
import 'ace-builds/src-noconflict/mode-xml';
import 'ace-builds/src-noconflict/theme-monokai';
import 'ace-builds/src-noconflict/theme-github';
import PropTypes from 'prop-types';

class AceCodeEditor extends Component {
    render() {
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'value' does not exist on type 'Readonly<... Remove this comment to see the full error message
        const { value, mode, name, height, markers, theme } = this.props;
        return (
            <AceEditor
                name={name}
                mode={mode}
                theme={`${theme ? theme : 'monokai'}`}
                value={value}
                readOnly={true}
                width={'100%'}
                height={height}
                setOptions={{
                    showLineNumbers: false,
                }}
                fontSize="14px"
                markers={markers}
            />
        );
    }
}

// @ts-expect-error ts-migrate(2339) FIXME: Property 'displayName' does not exist on type 'typ... Remove this comment to see the full error message
AceCodeEditor.displayName = 'AceCodeEditor';
// @ts-expect-error ts-migrate(2339) FIXME: Property 'propTypes' does not exist on type 'typeo... Remove this comment to see the full error message
AceCodeEditor.propTypes = {
    value: PropTypes.string,
    mode: PropTypes.string,
    name: PropTypes.string,
    height: PropTypes.string,
    markers: PropTypes.object,
    theme: PropTypes.string,
};
export default AceCodeEditor;