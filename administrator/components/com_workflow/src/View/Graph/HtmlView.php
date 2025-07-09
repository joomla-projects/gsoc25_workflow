<?php

/**
 * @package     Joomla.Administrator
 * @subpackage  com_workflow
 *
 * @copyright   (C) 2025 Open Source Matters, Inc. <https://www.joomla.org>
 * @license     GNU General Public License version 2 or later; see LICENSE.txt
 */

namespace Joomla\Component\Workflow\Administrator\View\Graph;

use Joomla\CMS\Factory;
use Joomla\CMS\Helper\ContentHelper;
use Joomla\CMS\Language\Text;
use Joomla\CMS\MVC\View\GenericDataException;
use Joomla\CMS\MVC\View\HtmlView as BaseHtmlView;
use Joomla\CMS\Router\Route;
use Joomla\CMS\Toolbar\ToolbarHelper;
use Joomla\Component\Workflow\Administrator\Model\GraphModel;

// phpcs:disable PSR1.Files.SideEffects
\defined('_JEXEC') or die;
// phpcs:enable PSR1.Files.SideEffects

/**
 * View class to display the entire workflow graph
 *
 * @since  __DEPLOY_VERSION__
 */
class HtmlView extends BaseHtmlView
{
    /**
     * The model state
     *
     * @var    object
     * @since  __DEPLOY_VERSION__
     */
    protected $state;

    /**
     * Items array
     *
     * @var    object
     * @since  __DEPLOY_VERSION__
     */
    protected $item;

    /**
     * The name of current extension
     *
     * @var    string
     * @since  __DEPLOY_VERSION__
     */
    protected $extension;

    /**
     * The ID of current workflow
     *
     * @var    integer
     * @since  __DEPLOY_VERSION__
     */
    protected $workflow;

    /**
     * The section of the current extension
     *
     * @var    string
     * @since  __DEPLOY_VERSION__
     */
    protected $section;

    /**
     * Display the view
     *
     * @param   string  $tpl  The name of the template file to parse; automatically searches through the template paths.
     *
     * @return  void
     *
     * @since  __DEPLOY_VERSION__
     */
    public function display($tpl = null)
    {
        /** @var GraphModel $model */
        $model = $this->getModel();

        // Get the data
        $this->state = $model->getState();
        $this->item  = $model->getItem();


        // Check for errors.
        if (\count($errors = $model->getErrors())) {
            throw new GenericDataException(implode("\n", $errors), 500);
        }

        $extension = $this->state->get('filter.extension');

        $parts = explode('.', $extension);

        $this->extension = array_shift($parts);

        if (!empty($parts)) {
            $this->section = array_shift($parts);
        }

        // Prepare workflow data for frontend
        $options = [
            'apiBaseUrl' => Route::_('index.php?option=com_workflow'),
            'extension' => $this->escape($this->extension),
            'workflowId' => $this->item->id,
        ];


        // Set the toolbar
        $this->addToolbar();

        // Inject workflow data as JS options for frontend
        $this->getDocument()->addScriptOptions('com_workflow', $options);

        // Display the template
        parent::display($tpl);
    }

    /**
     * Add the page title and toolbar.
     *
     * @return  void
     *
     * @since  __DEPLOY_VERSION__
     */
    protected function addToolbar()
    {
        Factory::getApplication()->getInput()->set('hidemainmenu', true);

        $user     = $this->getCurrentUser();
        $userId   = $user->id;
        $toolbar  = $this->getDocument()->getToolbar();

        $canDo     = ContentHelper::getActions($this->extension, 'workflow', $this->item->id);

        ToolbarHelper::title(Text::_('COM_WORKFLOW_GRAPH_WORKFLOWS_EDIT'), 'file-alt contact');

        // Since it's an existing record, check the edit permission, or fall back to edit own if the owner.
        $itemEditable = $canDo->get('core.edit') || ($canDo->get('core.edit.own') && $this->item->created_by == $userId);
        $arrow  = $this->getLanguage()->isRtl() ? 'arrow-right' : 'arrow-left';

        $shortcutsPopupId = 'shortcuts-popup-content';
        $shortcutsPopupOptions = json_encode([
            'src'             => '#' . $shortcutsPopupId,
            'width'           => '800px',
            'height'          => 'fit-content',
            'textHeader'      => Text::_('COM_WORKFLOW_GRAPH_SHORTCUTS_TITLE'),
            'preferredParent' => 'body',
        ]);
        $toolbar->link(
            'JTOOLBAR_BACK',
            Route::_('index.php?option=com_workflow&view=workflows&extension=' . $this->escape($this->item->extension))
        )
            ->icon('icon-' . $arrow);


        if ($itemEditable){
            $toolbar->customButton('undo')
                ->html('<joomla-toolbar-button><button onclick="WorkflowGraph.Event.fire(\'onClickUndoWorkflow\')" '
            . 'class="btn btn-info"><span class="icon-undo-2 icon-fw" aria-hidden="true"></span>'
            . Text::_('COM_WORKFLOW_UNDO') . '</button></joomla-toolbar-button>');

            $toolbar->customButton('redo')
                ->html('<joomla-toolbar-button><button onclick="WorkflowGraph.Event.fire(\'onClickRedoWorkflow\')" '
                    . 'class="btn btn-info"><span class="icon-redo icon-fw" aria-hidden="true"></span>'
                    . Text::_('COM_WORKFLOW_REDO') . '</button></joomla-toolbar-button>');



            $toolbar->help('Workflow');
            $toolbar->customButton('Shortcuts')
                ->html('<joomla-toolbar-button><button class="btn btn-info" data-joomla-dialog="'
                    . htmlspecialchars($shortcutsPopupOptions, ENT_QUOTES, 'UTF-8') . '"'
                    . 'title="' . Text::_('COM_WORKFLOW_GRAPH_SHORTCUTS') . '"><span class="fa fa-keyboard" aria-hidden="true"></span>'
                    . Text::_('COM_WORKFLOW_GRAPH_SHORTCUTS') . '</button></joomla-toolbar-button>');
        }
    }
}
