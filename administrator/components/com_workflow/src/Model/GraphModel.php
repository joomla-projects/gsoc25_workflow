<?php

/**
 * @package     Joomla.Administrator
 * @subpackage  com_workflow
 *
 * @copyright   (C) 2025 Open Source Matters, Inc. <https://www.joomla.org>
 * @license     GNU General Public License version 2 or later; see LICENSE.txt
 * @since       _DEPLOY_VERSION_
 */

namespace Joomla\Component\Workflow\Administrator\Model;

use Joomla\CMS\Factory;
use Joomla\CMS\MVC\Model\AdminModel;
use Joomla\Registry\Registry;
use Joomla\Utilities\ArrayHelper;

// phpcs:disable PSR1.Files.SideEffects
\defined('_JEXEC') or die;
// phpcs:enable PSR1.Files.SideEffects

/**
 * Model class for Graphical View of the workflow
 *
 * @since  _DEPLOY_VERSION_
 */
class GraphModel extends AdminModel
{
    /**
     * Auto-populate the model state.
     *
     * Note. Calling getState in this method will result in recursion.
     *
     * @return  void
     *
     * @since  4.0.0
     */
    public function populateState()
    {
        parent::populateState();

        $app       = Factory::getApplication();
        $context   = $this->option . '.' . $this->name;
        $extension = $app->getUserStateFromRequest($context . '.filter.extension', 'extension', null, 'cmd');

        $this->setState('filter.extension', $extension);
    }

    public function getName()
    {
        return 'workflow'; // TODO: change it to to handdle dynamically
    }


    /**
     * Abstract method for getting the form from the model.
     *
     * @param   array    $data      Data for the form.
     * @param   boolean  $loadData  True if the form is to load its own data (default case), false if not.
     *
     * @return  Form|boolean A Form object on success, false on failure
     *
     * @since   _DEPLOY_VERSION_
     */
    public function getForm($data = [], $loadData = true)
    {
        // Load the form.
        return false;
    }

    public function getTable($name = '', $prefix = '', $options = [])
    {
        return parent::getTable($name, $prefix, $options); // TODO: Change the logic
    }

    public function getItem($pk = null)
    {
        $pk    = (!empty($pk)) ? $pk : (int) $this->getState($this->getName() . '.id');
        $table = $this->getTable();

        if ($pk > 0) {
            // Attempt to load the row.
            $return = $table->load($pk);

            // Check for a table object error.
            if ($return === false) {
                // If there was no underlying error, then the false means there simply was not a row in the db for this $pk.
                if (!$table->getError()) {
                    $this->setError(Text::_('JLIB_APPLICATION_ERROR_NOT_EXIST'));
                } else {
                    $this->setError($table->getError());
                }

                return false;
            }
        }



        // Convert to \stdClass before adding other data
        $properties = get_object_vars($table);
        $item       = ArrayHelper::toObject($properties);
        $stages = $this->getStagesForWorkflow($item->id);
        $transitions = $this->getTransitionsForWorkflow($item->id);
        $item->stages = $stages;
        $item->transitions = $transitions;

        if (property_exists($item, 'params')) {
            $registry     = new Registry($item->params);
            $item->params = $registry->toArray();
        }

        return $item;
    }

    protected function getStagesForWorkflow(int $workflowId): array
    {
        $db = $this->getDatabase();

        $query = $db->getQuery(true)
            ->select('*')
            ->from($db->quoteName('#__workflow_stages'))
            ->where($db->quoteName('workflow_id') . ' = ' . (int) $workflowId)
            ->where($db->quoteName('published') . ' >= 0');

        return $db->setQuery($query)->loadObjectList();
    }

    protected function getTransitionsForWorkflow(int $workflowId): array
    {
        $db = $this->getDatabase();

        $query = $db->getQuery(true)
            ->select('*')
            ->from($db->quoteName('#__workflow_transitions'))
            ->where($db->quoteName('workflow_id') . ' = ' . (int) $workflowId)
            ->where($db->quoteName('published') . ' >= 0');

        return $db->setQuery($query)->loadObjectList();
    }

}
