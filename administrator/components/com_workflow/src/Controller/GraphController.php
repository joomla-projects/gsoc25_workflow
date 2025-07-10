<?php

/**
 * @package     Joomla.Administrator
 * @subpackage  com_workflow
 *
 * @copyright   (C) 2025 Open Source Matters, Inc. <https://www.joomla.org>
 * @license     GNU General Public License version 2 or later; see LICENSE.txt
 */

namespace Joomla\Component\Workflow\Administrator\Controller;

use Joomla\CMS\Language\Text;
use Joomla\CMS\MVC\Controller\AdminController;
use Joomla\CMS\MVC\Factory\MVCFactoryInterface;
use Joomla\CMS\Response\JsonResponse;
use Joomla\CMS\Router\Route;

// phpcs:disable PSR1.Files.SideEffects
\defined('_JEXEC') or die;
// phpcs:enable PSR1.Files.SideEffects


/**
 * The workflow Graphical View and Api controller
 *
 * @since __DEPLOY_VERSION__
 */
class GraphController extends AdminController
{
    /**
     * Present workflow id
     *
     * @var    integer
     * @since  __DEPLOY_VERSION__
     */
    protected $workflowId;

    /**
     * The extension
     *
     * @var    string
     * @since  __DEPLOY_VERSION__
     */
    protected $extension;

    /**
     * The section of the current extension
     *
     * @var    string
     * @since  __DEPLOY_VERSION__
     */
    protected $section;

    /**
     * The prefix to use with controller messages.
     *
     * @var    string
     * @since  __DEPLOY_VERSION__
     */
    protected $text_prefix = 'COM_WORKFLOW_GRAPH';


    public function __construct($config = [], ?MVCFactoryInterface $factory = null, $app = null, $input = null)
    {
        parent::__construct($config, $factory, $app, $input);

        // If workflow id is not set try to get it from input or throw an exception
        if (empty($this->workflowId)) {
            $this->workflowId = $this->input->getInt('id');
            if (empty($this->workflowId)) {
                $this->workflowId = $this->input->getInt('workflow_id');
            }

            if (empty($this->workflowId)) {
                throw new \InvalidArgumentException(Text::_('COM_WORKFLOW_GRAPH_ERROR_WORKFLOW_ID_NOT_SET'));
            }
        }

        // If extension is not set try to get it from input or throw an exception
        if (empty($this->extension)) {
            $extension = $this->input->getCmd('extension');

            $parts = explode('.', $extension);

            $this->extension = array_shift($parts);

            if (!empty($parts)) {
                $this->section = array_shift($parts);
            }

            if (empty($this->extension)) {
                throw new \InvalidArgumentException(Text::_('COM_WORKFLOW_GRAPH_ERROR_EXTENSION_NOT_SET'));
            }
        }
    }


    /**
     * Retrieves workflow data for graphical display in the workflow graph view.
     *
     * This method fetches the workflow details by ID, checks user permissions,
     * and returns the workflow information as a JSON response for use in the
     * graphical workflow editor or API consumers.
     *
     * @return  void  Outputs a JSON response with workflow data or error message.
     *
     * @since   __DEPLOY_VERSION__
     */
    public function getWorkflow(): void
    {
        try {
            $id    = $this->input->getInt('workflow_id');
            $model = $this->getModel('Workflow');

            if (empty($id)) {
                throw new \InvalidArgumentException(Text::_('COM_WORKFLOW_GRAPH_ERROR_INVALID_ID'));
            }

            $workflow = $model->getItem($id);

            if (empty($workflow->id)) {
                throw new \RuntimeException(Text::_('COM_WORKFLOW_GRAPH_ERROR_WORKFLOW_NOT_FOUND'));
            }

            // Check permissions
            if (!$this->app->getIdentity()->authorise('core.edit', $this->extension . '.workflow.' . $id)) {
                throw new \RuntimeException(Text::_('JERROR_ALERTNOAUTHOR'));
            }

            $response = [
                'id'          => $workflow->id,
                'title'       => $workflow->title,
                'description' => $workflow->description,
                'published'   => (bool) $workflow->published,
                'default'     => (bool) $workflow->default,
                'extension'   => $workflow->extension,
            ];

            echo new JsonResponse($response);
        } catch (\Exception $e) {
            echo new JsonResponse($e->getMessage(), 'error', true);
        }

        $this->app->close();
    }

    /**
     * Retrieves all stages for the specified workflow to be used in the workflow graph view.
     *
     * Fetches stages by workflow ID, decodes position data if available, and returns
     * the result as a JSON response for graphical editors or API consumers.
     *
     * @return  void  Outputs a JSON response with stages data or error message.
     *
     * @since   __DEPLOY_VERSION__
     */
    public function getStages()
    {
        try {
            $workflowId = $this->input->getInt('workflow_id');
            $model      = $this->getModel('Stages');

            $model->setState('filter.workflow_id', $workflowId);
            $model->setState('list.limit', 0); // Get all stages

            $stages   = $model->getItems();
            $response = [];

            foreach ($stages as $stage) {
                $response[] = [
                    'id'          => (int) $stage->id,
                    'title'       => $stage->title,
                    'description' => $stage->description,
                    'published'   => (bool) $stage->published,
                    'default'     => (bool) $stage->default,
                    'ordering'    => (int) $stage->ordering,
                    'position'    => $stage->position ? json_decode($stage->position, true) : null,
                    'workflow_id' => $stage->workflow_id,
                ];
            }
            echo new JsonResponse($response);
        } catch (\Exception $e) {
            echo new JsonResponse($e->getMessage(), 'error', true);
        }

        $this->app->close();
    }


    /**
     * Retrieves all transitions for the specified workflow to be used in the workflow graph view.
     *
     * Fetches transitions by workflow ID and returns the result as a JSON response
     * for graphical editors or API consumers.
     *
     * @return  void  Outputs a JSON response with transitions data or error message.
     *
     * @since   __DEPLOY_VERSION__
     */
    public function getTransitions()
    {
        try {
            $workflowId = $this->input->getInt('workflow_id');
            $model      = $this->getModel('Transitions');

            $model->setState('filter.workflow_id', $workflowId);
            $model->setState('list.limit', 0);

            $transitions = $model->getItems();
            $response    = [];

            foreach ($transitions as $transition) {
                $response[] = [
                    'id'            => (int) $transition->id,
                    'title'         => $transition->title,
                    'description'   => $transition->description,
                    'published'     => (bool) $transition->published,
                    'from_stage_id' => (int) $transition->from_stage_id,
                    'to_stage_id'   => (int) $transition->to_stage_id,
                    'ordering'      => (int) $transition->ordering,
                    'workflow_id'   => (int) $transition->workflow_id,
                ];
            }

            echo new JsonResponse($response);
        } catch (\Exception $e) {
            echo new JsonResponse($e->getMessage(), 'error', true);
        }

        $this->app->close();
    }
}
