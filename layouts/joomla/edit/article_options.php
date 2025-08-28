<?php

/**
 * @package     Joomla.Site
 * @subpackage  Layout
 *
 * @copyright   (C) 2025 Open Source Matters
 * @license     GNU General Public License version 2 or later
 */

defined('_JEXEC') or die;

use Joomla\CMS\Component\ComponentHelper;
use Joomla\CMS\Factory;
use Joomla\CMS\Language\Multilanguage;
use Joomla\CMS\Language\Text;

$app       = Factory::getApplication();
$wa        = Factory::getDocument()->getWebAssetManager();
$form      = $displayData->getForm();
$input     = $app->getInput();
$component = $input->getCmd('option', 'com_content');

if ($component === 'com_categories') {
    $extension = $input->getCmd('extension', 'com_content');
    $parts     = explode('.', $extension);
    $component = $parts[0];
}

$saveHistory = ComponentHelper::getParams($component)->get('save_history', 0);

/**
 * Merge both sets of fields into one
 */
$fields = $displayData->get('fields') ?? [
    'transition',
    ['parent', 'parent_id'],
    ['published', 'state', 'enabled'],
    ['category', 'catid'],
    'featured',
    'sticky',
    'access',
    'language',
    'tags',
    'note',
    'version_note',
];

$hiddenFields = $displayData->get('hidden_fields') ?? [];

if (!$saveHistory) {
    $hiddenFields[] = 'version_note';
}

if (!Multilanguage::isEnabled()) {
    $hiddenFields[] = 'language';
    $form->setFieldAttribute('language', 'default', '*');
}


// Ensure Joomla dialog assets are loaded
$wa->useScript('joomla.dialog-autocreate');

// Graph popup options
$popupId = 'workflow-graph-modal-content';
$popupOptions = json_encode([
    'src'             => '#' . $popupId,
    'height'          => 'fit-content',
    'textHeader'      => Text::_('COM_WORKFLOW_GRAPH'),
    'preferredParent' => 'body',
    'modal'           => true,
]);

$html   = [];
$html[] = '<fieldset class="form-vertical">';
$html[] = '<legend class="visually-hidden">' . Text::_('JGLOBAL_FIELDSET_GLOBAL') . '</legend>';

foreach ($fields as $field) {
    foreach ((array) $field as $f) {
        if ($form->getField($f)) {
            if (in_array($f, $hiddenFields)) {
                $form->setFieldAttribute($f, 'type', 'hidden');
            }

            // Special handling for transition field
            if ($f === 'transition') {
                $html[] = '<div style="display:flex;align-items:center;gap:8px;"><div class="w-100">';
                $html[] = $form->renderField($f);
                $html[] = '</div><div class="align-center text-center btns mt-3">
                <button type="button" class="btn btn-primary px-3 py-2" data-joomla-dialog=\'' . htmlspecialchars($popupOptions, ENT_QUOTES, 'UTF-8') . '\'>
                <span class="fa fa-diagram-project" aria-hidden="true"></span>
                </button>
                <div role="tooltip" id="tip-graph">
                ' . Text::_('COM_WORKFLOW_GRAPH') . '
                </div>
                </div>';
                $html[] = '</div>';
            } else {
                $html[] = $form->renderField($f);
            }

            break;
        }
    }
}

$html[] = '</fieldset>';

$wa->getRegistry()->addExtensionRegistryFile('com_workflow');
$wa->useStyle('com_workflow.workflowgraphclient');
$script = $wa->getAsset('script', name: 'com_workflow.workflowgraphclient')->getUri(true);

echo implode('', $html);
?>

<template id="workflow-graph-modal-content">
    <div class="p-3">
        <section
    class="d-flex flex-wrap align-items-center justify-content-between"
    aria-labelledby="workflow-main-title"
  >
    <div class="col-md-6 d-flex flex-column">
      <h1
        id="workflow-main-title"
        class="mb-2"
      >
      </h1>
      <dl
        class="d-flex align-items-center flex-wrap mb-0"
        aria-label="Workflow Details"
      >
        <dt class="visually-hidden">
          Status:
        </dt>
        <dd class="me-3 mb-1 d-flex mb-0">
          <span
            class="badge"
            role="status"
          >
          </span>
        </dd>

        <dt class="visually-hidden">
          Stage Count:
        </dt>
        <dd class="me-3 mb-1 d-flex mb-0">
          <span>
          </span>
        </dd>

        <dt class="visually-hidden">
          Transition Count:
        </dt>
        <dd class="me-3 mb-1 d-flex mb-0">
          <span>
          </span>
        </dd>
      </dl>
    </div>

   
  </section>
    <div id="workflow-graph">
        <div id="workflow-container" data-workflow-id="<?php echo (int) ($displayData->get('workflow_id') ?? 2); ?>">
            <div id="graph">
            <div id="stages"></div>
            <svg id="connections"></svg>
        </div>
    </div>
</div>
</template>
<script type="module" src="<?php echo $script ?>"></script>
