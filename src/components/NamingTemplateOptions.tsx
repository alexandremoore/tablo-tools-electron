// @flow
import React, { useState, useEffect } from 'react';

import Select from 'react-select';
import { InputGroup, Button } from 'react-bootstrap';

import {
  getTemplate,
  getTemplates,
  isCurrentTemplate
} from '../utils/namingTpl';
import { NamingTemplateType } from '../constants/app';

import SelectStyles from './SelectStyles';

type PropType = {
  type: string,
  slug: string,
  updateTemplate: (template: NamingTemplateType) => void,
  setDefaultTemplate: (template: NamingTemplateType) => void
};

export default function NamingTemplateOptions(props: PropType) {
  const { type, slug, updateTemplate, setDefaultTemplate } = props;

  const [options, setOptions] = useState([]);
  const [selected, setSelected] = useState({});

  useEffect(() => {
    loadTemplateOptions(type);
    loadTemplate(type, slug);
  }, [type, slug]);

  const loadTemplate = async (airingType: string, tplSlug: string) => {
    setSelected(await getTemplate(airingType, tplSlug));
  };

  const loadTemplateOptions = async (airingType: string) => {
    setOptions(await getTemplates(airingType));
  };

  const select = (option: { label: any, value: NamingTemplateType }) => {
    setSelected(option.value);
    updateTemplate(option.value);
  };

  if (!selected) return <> </>; //

  const prettyOpts = [];
  options.forEach(item =>
    prettyOpts.push({
      value: item,
      label: (
        <span className="naming-select-option">
          {isCurrentTemplate(item) ? (
            <span className="pl-1 pr-1 default-naming-ind">{item.label} </span>
          ) : (
            <span className="pl-1 pr-1">{item.label} </span>
          )}
        </span>
      ) //
    })
  );

  return (
    <div>
      <div className="d-inline-block ">
        <InputGroup size="sm" className="d-inline-block">
          <Select
            options={prettyOpts}
            onChange={select}
            styles={SelectStyles('30px', 200)}
            value={options.filter(option => option.slug === selected.slug)}
          />
        </InputGroup>
      </div>
      {!isCurrentTemplate(selected) ? (
        <Button
          size="xs"
          variant="outline-success"
          title="Use by default"
          onClick={() => {
            setDefaultTemplate(selected);
            loadTemplateOptions(type);
          }}
          className="ml-2 d-inline-block"
        >
          <span className="fa fa-check" />
        </Button>
      ) : (
        ''
      )}
    </div>
  );
}
// NamingTemplateOptions.defaultProps = { slug: '' };
